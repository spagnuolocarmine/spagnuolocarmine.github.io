---
layout: category
taxonomy: project
author_profile: true
permalink: /projects/
title: "Projects"
last_modified_at: 2019-01-20T10:19:56-04:00

---



<!-- Place this tag in your head or just before your close body tag. -->
<script async defer src="https://buttons.github.io/buttons.js"></script>
<!-- Place this tag where you want the button to render. -->
<a class="github-button" href="https://github.com/spagnuolocarmine" data-size="large" aria-label="Follow @spagnuolocarmine on GitHub">Follow @spagnuolocarmine</a>
<!-- Place this tag where you want the button to render. -->

{% for post in paginator.posts %}

  	{% include archive-single.html %}

{% endfor %}

{% include paginator.html %}