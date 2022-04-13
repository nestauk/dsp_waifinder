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
