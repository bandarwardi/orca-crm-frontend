import bs4, sys
soup = bs4.BeautifulSoup(open(sys.argv[1], encoding='utf-8'), 'html.parser')
for c in soup.body.children:
    if c.name:
        print(c.name, c.get('class'))
