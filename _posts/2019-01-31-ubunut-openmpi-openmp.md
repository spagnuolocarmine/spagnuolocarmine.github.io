---
layout: posts
title: Ubunutu machine with OpenMPI and OpenMP
category: project
---
<!-- Place this tag in your head or just before your close body tag. -->
<script async defer src="https://buttons.github.io/buttons.js"></script>
# Ubuntu with OpenMPI and OpenMP

This project provides scripts and tutorial to install OpenMPI and OpenMP on a Ubuntu Linux.

## Prerequisites
 - Ubuntu Linux 18.04 LTS Server Edition
 - SSH Key
 
## Install

Run the script on you machine ```source install.sh```.

The program will create a new user pcpc and exchanges the given ssh keys.

### How to generate your SSH keys

Execute che command ```ssh-keygen```.

### Built environment
- user: pcpc
- vim
- htop
- OpenMPI 4.0
- OpenMP included in the GNU GCC (last version)

## Test the environment

You can test your local environment using the program test.c.

1. Compile the program: ```mpicc test.c -o test```
2. Run the porgram: ```mpirun -np 2 test```

You can run directly on an homogeneous cluster machine that has been built using the same install script. You can run: ```mpirun -np 2 --hostfile hfile test```.
An example host-file is:
```
# This is an example hostfile.  Comments begin with #
#
# The following node is a single processor machine:
foo.example.com
 
# The following node is a dual-processor machine:
bar.example.com slots=2
 
# The following node is a quad-processor machine, and we absolutely
# want to disallow over-subscribing it:
yow.example.com slots=4 max-slots=4
```


<!-- Place this tag where you want the button to render. -->
<a class="github-button" href="https://github.com/spagnuolocarmine/ubuntu-openmpi-openmp/archive/master.zip" data-icon="octicon-cloud-download" data-size="large" aria-label="Download spagnuolocarmine/ubuntu-openmpi-openmp on GitHub">Download</a> <a class="github-button" href="https://github.com/spagnuolocarmine/ubuntu-openmpi-openmp" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star spagnuolocarmine/ubuntu-openmpi-openmp on GitHub">Star</a>