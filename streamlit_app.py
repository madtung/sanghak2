import streamlit as st
import streamlit.components.v1 as components
import os

st.set_page_config(layout="wide") # Streamlit 페이지의 기본 레이아웃을 '넓게' 설정
# 1. HTML 파일 경로 설정
# 현재 스크립트 파일의 디렉토리를 기준으로 'frontend/index.html' 경로를 설정합니다.
# GitHub에 배포할 때 파일 경로를 올바르게 찾는 것이 중요합니다.
parent_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(parent_dir, "frontend", "index.html")

# 2. HTML 파일 내용 읽기
try:
    with open(html_path, 'r', encoding='utf-8') as f:
        html_data = f.read()
except FileNotFoundError:
    st.error(f"Error: index.html 파일을 찾을 수 없습니다. 경로: {html_path}")
    html_data = "<h1>File not found</h1>"

st.title("AI Studio JavaScript App Demo")

# 수정 예시 1: 높이를 늘림
components.html(
    html_data,
    height=1200, # 필요한 만큼 충분히 큰 값 (예: 1200px)
    scrolling=True
)

# 수정 예시 2: 전체 화면 높이를 사용 (적절한 높이를 실험해야 함)
# st.set_page_config(layout="wide")를 사용했다면 너비는 자동으로 넓어짐
