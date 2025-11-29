import streamlit as st
import streamlit.components.v1 as components
import os

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

# 3. Streamlit 컴포넌트를 사용하여 HTML/JS 임베드
# height를 지정하여 임베드된 콘텐츠의 크기를 설정합니다.
components.html(
    html_data,
    height=600, # 앱의 크기에 맞게 조정
    scrolling=True
)

# 참고: 이 방식으로 임베드된 JavaScript 앱은 
# Streamlit의 Python 코드와 직접적으로 데이터를 주고받을 수 없습니다.
