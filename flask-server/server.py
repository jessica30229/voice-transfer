from flask import Flask, render_template, request
import convert_realtime

app = Flask(__name__)

@app.route('/')
def root():
    return "ROOT!"
@app.route('/audioUpload/<in_url>')
def audioUpload(in_url):
    #in_url = "https://drive.google.com/uc?export=download&id=1TZPfZkzCyO3Wb9_EjEzJ5ZEqsGU4PenC";
    out_url = "../client/src/converted_audio/"
    convert_realtime.web_voice_convert(in_url=in_url, out_url=out_url)
    return "done!"
'''
@app.route('/getname',method=['GET'])
def getname():
    name = request.args.get('name')
    return render_template('get.html',**locals())
'''
if __name__ == '__main__':
    app.run(debug=True)