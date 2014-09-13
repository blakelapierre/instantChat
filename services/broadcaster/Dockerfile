FROM ubuntu:14.04

RUN apt-get update
RUN apt-get install -y xvfb chromium-browser

ENV TOKEN 9999

CMD xvfb-run --server-args='-screen 0 1024x768x24 -ac' chromium-browser --user-data-dir https://instachat.io/broadcaster.html?token=$TOKEN