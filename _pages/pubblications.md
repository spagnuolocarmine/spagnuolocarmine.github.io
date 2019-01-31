---
layout: single
author_profile: true
permalink: /pubblications/
title: "Pubblications"
last_modified_at: 2019-01-20T10:19:56-04:00
toc: true
---

Visit also my [Google Scholar Profile](https://scholar.google.it/citations?user=Urf6lNEAAAAJ&hl=it).

## List order by Year
<ul>
	{% assign sorted = (site.data.citations | sort: 'Year') | reverse %}
	{% for article in sorted %}
		
			<li>
				
				{{ article.Authors }}
				{{ article.Title }}
				
			</li>
	
	{% endfor %}
</ul>
