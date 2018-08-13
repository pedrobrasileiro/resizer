Resizer


USE
---------
curl -X POST \
  http://localhost:5555/resize \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{ 
	"remote_image" : "https://ideiagelada.files.wordpress.com/2011/09/uhuuu.png", 
	"width" : 100
}'

curl -X GET \
  'http://localhost:5555/resize?height=100&remote_image=https://ideiagelada.files.wordpress.com/2011/09/uhuuu.png' \
  -H 'Cache-Control: no-cache'


Start Server
--------
$ docker-compose up --build

Params
-------- 

- remote_image
- width ou height (if inform only one, resize  proportionality)
