import os
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Customer Segmentation & RFM Dashboard | Austin Ajay",
    page_icon="🛍️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header { font-size: 2.2rem; font-weight: 800; color: #1E293B; margin-bottom: 0.2rem; }
    .sub-header { color: #64748B; font-size: 1.05rem; margin-bottom: 1.5rem; }
    .metric-card {
        background-color: #F8FAFC;
        border-radius: 10px;
        padding: 16px;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_data():
    file_path = os.path.join("data", "customer_segments.csv")
    if not os.path.exists(file_path):
        file_path = os.path.join("..", "Data-Analyst-Portfolio", "Customer Segmentation Analysis", "customer_segments.csv")
    df = pd.read_csv(file_path)
    return df

try:
    df = load_data()
except Exception as e:
    st.error(f"Error loading dataset: {e}")
    st.stop()

# Sidebar
st.sidebar.title("Navigation & Filters")
st.sidebar.markdown("**Author:** Austin Ajay  \n**Dataset:** UK Online Retail II")

selected_tiers = st.sidebar.multiselect(
    "Filter by Value Tier",
    options=list(df['Segment_Tier'].unique()),
    default=list(df['Segment_Tier'].unique())
)

selected_segments = st.sidebar.multiselect(
    "Filter by Customer Segment",
    options=list(df['Segment'].unique()),
    default=list(df['Segment'].unique())
)

filtered_df = df[
    (df['Segment_Tier'].isin(selected_tiers)) & 
    (df['Segment'].isin(selected_segments))
]

# Header
st.markdown('<div class="main-header">🛍️ Customer Segmentation & RFM Analytics Executive Portal</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Advanced Recency, Frequency & Monetary Value Segmentation for Strategic Retention & Revenue Growth</div>', unsafe_allow_html=True)

# KPI Cards
total_revenue = filtered_df['Monetary'].sum()
total_customers = len(filtered_df)
avg_spend = total_revenue / total_customers if total_customers > 0 else 0
avg_recency = filtered_df['Recency'].mean() if total_customers > 0 else 0
avg_freq = filtered_df['Frequency'].mean() if total_customers > 0 else 0

kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
kpi1.metric("Total Revenue", f"£{total_revenue:,.2f}")
kpi2.metric("Filtered Customers", f"{total_customers:,}")
kpi3.metric("Avg Spend / Customer", f"£{avg_spend:,.2f}")
kpi4.metric("Avg Recency", f"{avg_recency:.0f} days")
kpi5.metric("Avg Frequency", f"{avg_freq:.1f} orders")

st.markdown("---")

# Visualizations Row 1
tab1, tab2, tab3, tab4 = st.tabs(["📊 Segment Overview", "🎯 RFM Deep Dive", "💡 What-If Simulator", "🔍 Customer Explorer"])

with tab1:
    col_a, col_b = st.columns([1, 1])
    
    with col_a:
        st.subheader("Revenue by Segment")
        seg_rev = filtered_df.groupby('Segment')['Monetary'].sum().reset_index()
        fig_rev = px.pie(
            seg_rev, values='Monetary', names='Segment',
            hole=0.45,
            color_discrete_sequence=px.colors.qualitative.Prism
        )
        fig_rev.update_traces(textposition='inside', textinfo='percent+label')
        fig_rev.update_layout(margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_rev, use_container_width=True)
        
    with col_b:
        st.subheader("Customer Count by Segment")
        seg_cnt = filtered_df.groupby('Segment')['CustomerID'].count().reset_index()
        fig_cnt = px.bar(
            seg_cnt, x='Segment', y='CustomerID',
            color='Segment',
            color_discrete_sequence=px.colors.qualitative.Prism,
            labels={'CustomerID': 'Number of Customers'}
        )
        fig_cnt.update_layout(showlegend=False, margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_cnt, use_container_width=True)

with tab2:
    st.subheader("Recency vs. Frequency vs. Monetary Value")
    fig_scatter = px.scatter(
        filtered_df,
        x='Recency',
        y='Frequency',
        size='Monetary',
        color='Segment',
        hover_data=['CustomerID', 'Country', 'RFM_Score', 'Segment_Tier'],
        log_y=True,
        color_discrete_sequence=px.colors.qualitative.Prism,
        labels={'Recency': 'Days Since Last Purchase (Recency)', 'Frequency': 'Total Orders (Frequency)'}
    )
    fig_scatter.update_layout(margin=dict(t=20, b=20, l=20, r=20))
    st.plotly_chart(fig_scatter, use_container_width=True)

with tab3:
    st.subheader("Interactive Revenue Uplift Simulator")
    st.markdown("Simulate financial impact by testing retention and loyalty enhancement scenarios.")
    
    col_s1, col_s2 = st.columns(2)
    with col_s1:
        at_risk_reactivation = st.slider(
            "Reactivate At-Risk Customers (%):",
            min_value=0, max_value=30, value=10, step=1
        )
    with col_s2:
        champions_frequency_boost = st.slider(
            "Boost Champions Repeat Order Frequency (%):",
            min_value=0, max_value=25, value=5, step=1
        )
        
    at_risk_rev = df[df['Segment'] == 'At Risk']['Monetary'].sum()
    champ_rev = df[df['Segment'] == 'Champions']['Monetary'].sum()
    
    recovered_at_risk = at_risk_rev * (at_risk_reactivation / 100)
    incremental_champ = champ_rev * (champions_frequency_boost / 100)
    total_projected_gain = recovered_at_risk + incremental_champ
    
    m1, m2, m3 = st.columns(3)
    m1.metric("Recovered At-Risk Revenue", f"£{recovered_at_risk:,.2f}")
    m2.metric("Incremental Champions Growth", f"£{incremental_champ:,.2f}")
    m3.metric("Total Projected Uplift", f"£{total_projected_gain:,.2f}", delta=f"+{((total_projected_gain/total_revenue)*100):.1f}%")

with tab4:
    st.subheader("Customer Records Explorer")
    search = st.text_input("Search by Customer ID or Country:")
    display_df = filtered_df
    if search:
        display_df = display_df[
            display_df['CustomerID'].astype(str).str.contains(search, case=False) |
            display_df['Country'].astype(str).str.contains(search, case=False)
        ]
    st.dataframe(
        display_df[['CustomerID', 'Country', 'Recency', 'Frequency', 'Monetary', 'RFM_Score', 'Segment', 'Segment_Tier']],
        use_container_width=True,
        hide_index=True
    )

st.markdown("---")
st.markdown("Developed by **Austin Ajay** | Customer Segmentation & RFM Analysis Portfolio")
