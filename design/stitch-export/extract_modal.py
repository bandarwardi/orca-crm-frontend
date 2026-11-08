import bs4, sys
soup = bs4.BeautifulSoup(open(sys.argv[1], encoding='utf-8'), 'html.parser')
children = [c for c in soup.body.children if c.name]
if len(children) >= 3:
    modal = children[2]
    open(r'f:\apps\orca\crm\design\stitch-export\modal_extracted.html', 'w', encoding='utf-8').write(modal.prettify())
