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
