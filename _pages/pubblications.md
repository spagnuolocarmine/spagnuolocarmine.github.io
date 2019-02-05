---
layout: single
author_profile: true
permalink: /pubblications/
title: "Pubblications"
last_modified_at: 2019-01-20T10:19:56-04:00
toc: true
---



Visit also my [Google Scholar Profile](https://scholar.google.it/citations?user=Urf6lNEAAAAJ&hl=it).
<style>
span.a {
  font-style: normal;
}

span.b {
  font-style: italic;
}

span.c {
  font-style: oblique;
}
span.r {
  color: red;
}
</style>

## PhD Thesis

<ul>
	<li>
		<span class="c">Carmine Spagnuolo</span>.
		<span class="c">Scalable Computational Science</span>.
		<span class="a">PhD Thesis, University of Salerno</span>.
		<span class="r">2017</span>.
		
	</li>
</ul>
[Download](http://elea.unisa.it/bitstream/handle/10556/2581/abstract%20in%20italiano%20C.%20Spagnuolo.pdf?sequence=3&isAllowed=y)


## Journals
<ul>
	{% assign sorted = site.data.pubblications | sort: 'Year' | reverse %}
	{% for article in sorted %}
			{% if article.Source == 'Journal' %}
				<li>
					<span class="c">{{ article.Authors }}</span>.
					<span class="c">{{ article.Title }}</span>.
					<span class="a">{{ article.Publication }}</span>.
					<span class="r">{{ article.Year }}</span>.
				</li>
			{% endif %}
	{% endfor %}
</ul>

## Conferences
<ul>
	{% assign sorted = site.data.pubblications | sort: 'Year' | reverse %}
	{% for article in sorted %}
			{% if article.Source == 'Conference' %}
				<li>
					<span class="c">{{ article.Authors }}</span>.
					<span class="c">{{ article.Title }}</span>.
					<span class="a">{{ article.Publication }}</span>.
					<span class="r">{{ article.Year }}</span>.
				</li>
			{% endif %}
	{% endfor %}
</ul>
