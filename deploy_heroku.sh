git pull origin master
git checkout live
git merge master
grunt build
git add -A
git commit -m 'public dist'
git push heroku live:master
git checkout master
