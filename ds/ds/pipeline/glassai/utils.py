import re
from io import BytesIO
from typing import Optional
from zipfile import ZipFile

import pandas as pd
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


def chrome_driver() -> WebDriver:
    """Headless Selenium Chrome Driver."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options,
    )
    driver.set_page_load_timeout(10)
    driver.set_script_timeout(10)
    return driver


def find_download_url(driver: WebDriver, geo_portal_url: str) -> str:
    """Find download button and extract download URL."""
    driver.implicitly_wait(10)  # Poll DOM for up to 10 seconds when finding elements
    driver.get(geo_portal_url)
    return driver.find_element(by=By.LINK_TEXT, value="Download").get_attribute("href")


def download_zip(url: str) -> ZipFile:
    """Download a URL and load into `ZipFile`."""
    response = requests.get(url)
    response.raise_for_status()
    return ZipFile(BytesIO(response.content), "r")


def get_nspl_csv_zip_path(zipfile: ZipFile) -> str:
    """Get the path within the zip folder to the NSPL CSV lookup."""
    return next(
        filter(
            lambda name: re.match(r"Data/NSPL_[A-Z]{3}_[0-9]{4}_UK.csv", name),
            zipfile.namelist(),
        )
    )


def read_nspl_data(
    zipfile: ZipFile,
) -> pd.DataFrame:
    """Read NSPL data and output as a DataFrame"""
    nspl_zip_path = get_nspl_csv_zip_path(zipfile)

    return pd.read_csv(
        zipfile.open(nspl_zip_path),
        usecols={"pcds", "lat", "long"},
        index_col="pcds",
    )


def get_cleaned_postcode(ai_companies_df):
    """
    There are two postcode columns in the data.
    source_postcode:
        comes from the website or linkedin is likely to be the trading
        address of the company.
    ch_postcode:
        comes from the matched Companies House record and is the registered
        address of the company.

    If source_postcode isn't given we use ch_postcode,
    we also lower case and remove spaces from the postcode.
    If the data isn't given it is set to a blank string,
    so we need to convert this to None.
    """

    def clean_postcode(pcd):
        return pcd.lower().replace(" ", "")

    first_pcd = ai_companies_df["source_postcode"].map(clean_postcode).replace("", None)
    second_pcd = ai_companies_df["ch_postcode"].map(clean_postcode).replace("", None)

    return first_pcd.fillna(second_pcd)


def get_lat_long(ai_companies_df, nspl_data):

    # NSPL doesn't have lat/long for all postcodes (e.g. Isle of Man data)
    # NSPL code this with 'lat'=99.999999 & 'long'=0.0
    nspl_data = nspl_data[
        ~((nspl_data["lat"] == 99.999999) & (nspl_data["long"] == 0.0))
    ]
    # Normalise since glassAI postcodes can sometimes be lower case
    nspl_data.index = nspl_data.index.str.lower().str.replace(" ", "")

    return (
        ai_companies_df["cleaned_postcode"].map(nspl_data["lat"]),
        ai_companies_df["cleaned_postcode"].map(nspl_data["long"]),
    )
