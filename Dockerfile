FROM python:3-alpine

ARG BUILD_DATE
ARG VCS_REF

# Set labels (see https://microbadger.com/labels)
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF


RUN mkdir -p /usr/src
COPY app /usr/src/app
WORKDIR /usr/src/app
RUN pip install --no-cache-dir -r requirements.txt

# Expose the Flask port
EXPOSE 6007

CMD [ "python", "./app.py" ]
