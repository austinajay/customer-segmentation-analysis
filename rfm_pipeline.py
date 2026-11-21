"""
================================================================================
Customer Segmentation & RFM Analysis Pipeline
Author: Austin Ajay (github.com/austinajay)
Dataset: Online Retail II (UK E-Commerce)
================================================================================
This script automates the complete end-to-end RFM analysis pipeline:
1. Ingestion & Preprocessing of raw transactional e-commerce data
2. RFM (Recency, Frequency, Monetary) metric calculation per customer
3. Quintile-based scoring (1 to 5) for R, F, and M
4. Segment categorization (Champions, Loyal, Potential, New Customers, Need Attention, About to Sleep, At Risk)
5. Metric aggregation & strategic business playbook generation
6. Clean dataset export to CSV and JSON for dashboard consumption
================================================================================
"""

import os
import sys
import argparse
import json
import pandas as pd
import numpy as np
from datetime import datetime

SEGMENT_RULES = [
    {
        'segment': 'Champions',
        'tier': 'High Value',
        'condition': lambda r, f, m: (r >= 4) & (f >= 4) & (m >= 4),
        'strategy': 'VIP loyalty perks, early product drops, priority support, referral bonuses.'
    },
    {
        'segment': 'Loyal',
        'tier': 'High Value',
        'condition': lambda r, f, m: (r >= 3) & (f >= 3) & (m >= 3),
        'strategy': 'Tiered loyalty progression, upselling premium categories, product review requests.'
    },
    {
        'segment': 'Potential',
        'tier': 'Medium Value',
        'condition': lambda r, f, m: (r >= 3) & (f >= 3) & (m <= 2),
        'strategy': 'Threshold incentives (e.g. ₹20 off ₹100), bundle discounts to lift basket size.'
    },
    {
        'segment': 'New Customers',
        'tier': 'Medium Value',
        'condition': lambda r, f, m: (r >= 4) & (f <= 2),
        'strategy': 'Automated welcome onboarding series, best-seller guide, 30-day repeat coupon.'
    },
    {
        'segment': 'Need Attention',
        'tier': 'Medium Value',
        'condition': lambda r, f, m: ((r == 2) | (r == 3)) & (f == 2),
        'strategy': 'Re-engagement email campaign, limited-time comeback coupon, satisfaction survey.'
    },
    {
        'segment': 'About to Sleep',
        'tier': 'Low Value/At Risk',
        'condition': lambda r, f, m: ((r == 2) | (r == 3)) & (f == 1),
        'strategy': 'Win-back campaigns, seasonal catalog showcases, feedback discovery inquiry.'
    },
    {
        'segment': 'At Risk',
        'tier': 'Low Value/At Risk',
        'condition': lambda r, f, m: (r <= 2),
        'strategy': 'Aggressive churn prevention playbook, deep re-activation offers, multi-channel outreach.'
    }
]

def load_and_clean_data(file_path: str) -> pd.DataFrame:
    print(f"[*] Ingesting transaction dataset from: {file_path}")
    df = pd.read_csv(file_path)
    
    # Standardize column types
    if 'InvoiceDate' in df.columns:
        df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    
    # Remove records without CustomerID
    df = df.dropna(subset=['CustomerID'])
    df['CustomerID'] = df['CustomerID'].astype(int)
    
    # Filter returns/cancellations and zero price
    df = df[(df['Quantity'] > 0) & (df['UnitPrice'] > 0)]
    
    if 'TotalPrice' not in df.columns:
        df['TotalPrice'] = df['Quantity'] * df['UnitPrice']
        
    print(f"[+] Cleaned transactions: {len(df):,} rows across {df['CustomerID'].nunique():,} unique customers")
    return df

def calculate_rfm(df: pd.DataFrame, reference_date: datetime = None) -> pd.DataFrame:
    if reference_date is None:
        reference_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)
        
    print(f"[*] Computing RFM metrics using reference snapshot date: {reference_date.strftime('%Y-%m-%d')}")
    
    # Aggregate at customer level
    rfm = df.groupby('CustomerID').agg(
        Last_Purchase_Date=('InvoiceDate', 'max'),
        First_Purchase_Date=('InvoiceDate', 'min'),
        Frequency=('InvoiceNo', 'nunique'),
        Monetary=('TotalPrice', 'sum'),
        Country=('Country', lambda x: x.mode()[0] if not x.empty else 'Unknown')
    ).reset_index()
    
    # Recency in days
    rfm['Recency'] = (reference_date - rfm['Last_Purchase_Date']).dt.days
    rfm['Customer_Tenure_Days'] = (reference_date - rfm['First_Purchase_Date']).dt.days
    rfm.drop(columns=['First_Purchase_Date'], inplace=True)
    
    # Quantile scoring (1 to 5)
    # Recency: lower days is better -> invert labels [5, 4, 3, 2, 1]
    rfm['Recency_Score'] = pd.qcut(rfm['Recency'], q=5, labels=[5, 4, 3, 2, 1]).astype(int)
    
    # Frequency: rank with duplicate handling
    rfm['Frequency_Score'] = pd.qcut(rfm['Frequency'].rank(method='first'), q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    
    # Monetary: higher monetary is better
    rfm['Monetary_Score'] = pd.qcut(rfm['Monetary'], q=5, labels=[1, 2, 3, 4, 5]).astype(int)
    
    # Combined RFM Score string/int
    rfm['RFM_Score'] = (
        rfm['Recency_Score'].astype(str) + 
        rfm['Frequency_Score'].astype(str) + 
        rfm['Monetary_Score'].astype(str)
    ).astype(int)
    
    # Assign Segments
    rfm['Segment'] = 'At Risk'
    rfm['Segment_Tier'] = 'Low Value/At Risk'
    
    r = rfm['Recency_Score']
    f = rfm['Frequency_Score']
    m = rfm['Monetary_Score']
    
    for rule in reversed(SEGMENT_RULES):
        mask = rule['condition'](r, f, m)
        rfm.loc[mask, 'Segment'] = rule['segment']
        rfm.loc[mask, 'Segment_Tier'] = rule['tier']
        
    return rfm

def print_executive_report(rfm: pd.DataFrame):
    total_rev = rfm['Monetary'].sum()
    total_cust = len(rfm)
    
    print("\n" + "=" * 70)
    print("       EXECUTIVE CUSTOMER SEGMENTATION & RFM SUMMARY REPORT       ")
    print("=" * 70)
    print(f"Total Active Customers : {total_cust:,}")
    print(f"Total Revenue Realized : ₹{total_rev:,.2f}")
    print(f"Average Customer Value : ₹{(total_rev / total_cust):,.2f}")
    print("-" * 70)
    
    summary = rfm.groupby('Segment').agg(
        Customers=('CustomerID', 'count'),
        Total_Revenue=('Monetary', 'sum'),
        Avg_Recency=('Recency', 'mean'),
        Avg_Freq=('Frequency', 'mean'),
        Avg_Spend=('Monetary', 'mean')
    ).reset_index()
    
    summary['Cust_Share_%'] = (summary['Customers'] / total_cust * 100).round(1)
    summary['Rev_Share_%'] = (summary['Total_Revenue'] / total_rev * 100).round(1)
    summary = summary.sort_values('Total_Revenue', ascending=False)
    
    for _, row in summary.iterrows():
        print(f"[{row['Segment'].upper()}]")
        print(f"  Customers : {row['Customers']:,} ({row['Cust_Share_%']}%)")
        print(f"  Revenue   : ₹{row['Total_Revenue']:,.2f} ({row['Rev_Share_%']}%)")
        print(f"  Averages  : Recency {row['Avg_Recency']:.0f}d | Freq {row['Avg_Freq']:.1f} orders | Spend ₹{row['Avg_Spend']:,.2f}")
        print()
    print("=" * 70)

def main():
    parser = argparse.ArgumentParser(description="Customer Segmentation & RFM Analysis Pipeline")
    parser.add_argument('--input', type=str, default='data/cleaned_transactions.csv', help='Path to transactions CSV')
    parser.add_argument('--output', type=str, default='data/customer_segments.csv', help='Output customer segments CSV')
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Note: Input file '{args.input}' not found. Looking in parent directories...")
        alt_input = os.path.join("..", "Data-Analyst-Portfolio", "Customer Segmentation Analysis", "cleaned_transactions.csv")
        if os.path.exists(alt_input):
            args.input = alt_input
        else:
            print(f"Error: Unable to locate transactions dataset.")
            sys.exit(1)
            
    df = load_and_clean_data(args.input)
    rfm = calculate_rfm(df)
    
    os.makedirs(os.path.dirname(args.output) or '.', exist_ok=True)
    rfm.to_csv(args.output, index=False)
    print(f"[+] Customer segmentation output saved to: {args.output}")
    
    print_executive_report(rfm)

if __name__ == '__main__':
    main()

