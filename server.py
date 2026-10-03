# Optional: run `python server.py` then open http://localhost:8000
# (You can also just double-click index.html - no server needed.)
import http.server, socketserver
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store');super().end_headers()
socketserver.TCPServer.allow_reuse_address=True
with socketserver.TCPServer(('',8000),H) as s:
    print('Game running at http://localhost:8000  (Ctrl+C to stop)');s.serve_forever()
