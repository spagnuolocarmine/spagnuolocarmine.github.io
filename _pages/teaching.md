---
layout: page
permalink: /teaching/
title: teaching
description: 
nav: true
nav_order: 2
---
{% assign ts = site.tcs %}
{%- for project in site.teaching -%}

      {% include projects.html %}

{%- endfor %}
