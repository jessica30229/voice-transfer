from flask import Flask, render_template, request
from werkzeug.utils import secure_filename
import convert_realtime

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/"

@app.route('/')
def root():
    return "ROOT!"

@app.route('/audioUpload/<in_url>')
def audioUpload(in_url):
    print(in_url)
    #in_url = "https://drive.google.com/uc?export=download&id=1TZPfZkzCyO3Wb9_EjEzJ5ZEqsGU4PenC";
    out_url = "../client/static"
    convert_realtime.web_voice_convert(in_url=in_url, out_url=out_url)
    # return "../flask-server/static/output.wav"

if __name__ == '__main__':
    app.run(debug=True)