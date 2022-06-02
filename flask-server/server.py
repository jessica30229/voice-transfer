from flask import Flask, render_template, request
import convert_realtime

app = Flask(__name__)

@app.route('/')
def run_script(in_url, out_url):
    return convert_realtime.web_voice_convert(in_url, out_url)

@app.route('/getname',method=['GET'])
def getname():
    name = request.args.get('name')
    return render_template('get.html',**locals())

if __name__ == '__main__':
    app.run(debug=True)