import urllib.request
import re

url = "https://jumpshare.com/v/amgavbNZhiAwzQ2pQ9ci"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    match = re.search(r'https://cdn\.jumpshare\.com/preview/[^\s"'"'"']+\.mp4[^\s"'"'"']*', html)
    if match:
        print(match.group(0))
    else:
        print("No mp4 found")
except Exception as e:
    print(e)
