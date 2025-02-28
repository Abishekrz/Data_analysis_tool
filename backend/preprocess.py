import pandas as pd

def preprocess_data(df):
    df.fillna(0, inplace=True)  # Example: Replace NaN with 0
    return df
