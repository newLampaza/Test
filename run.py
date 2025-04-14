from routes import app

@app.after_request
def add_cors_headers(response):
    response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)