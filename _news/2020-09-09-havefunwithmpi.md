---
layout: post
title: HAVE FUN WITH MPI (in C language) a new interactive book available on Tech.io
date: 2020-09-09
---


<a href="http://bit.ly/have-fun-with-mpi-in-c" ><img src="assets/img/cover.png" alt="logo" height="120" align="center"/></a>


### An interactive tutorial playground available on [Tech.io](http://bit.ly/have-fun-with-mpi-in-c).

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/) 
[![Open Source Love svg3](https://badges.frapsoft.com/os/v3/open-source.svg?v=103)](http://bit.ly/have-fun-with-mpi-in-c)


[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/spagnuolocarmine/playground-mpi) 
[![GitHub issues](https://img.shields.io/github/issues/Naereen/StrapDown.js.svg)](https://github.com/spagnuolocarmine/playground-mpi/issues/) 


[![Donate](https://img.shields.io/badge/PayPal-Donate%20to%20Author-blue.svg)](https://www.paypal.me/CarmineSpagnuolo) [![Ask Me Anything !](https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg)](https://github.com/spagnuolocarmine/playground-mpi/issues)
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Have%20fun%20with%20MPI%20in%20C%20&url=http://bit.ly/have-fun-with-mpi-in-c&hashtags=c,mpi,programming,tutorial,parallel-computing,distributed-computing,distributed-memory) 

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
<img alt="Licenza Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />
</a><br />This work is shared under the 
<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.</a>

# Preface

> Hi guys! Either you are a Computer Science student, or just a brave programmer who wants to start learning the basic of parallel programming in shared and/or distributed memory systems, this (play)book will light your way on (hopefully!).
First, why a playground on Tech.io? Generally, among others, a playground is a useful tool to explain both general concepts or more specific topics. What is amazing, however, it is the possibility to add runnable code samples that every reader can hack. Basically, you can play with snippets of code: just type a few lines and see what will change the next time you run that piece.
This playground is focused on Programming with MPI. Starting from what is (M)essage (P)assing (I)nterface, we will then approach and work with OpenMPI, an open-source MPI implementation. You will find a bunch of runnable snippets for each newly introduced concept, along with end-chapter questions. Nothing is mandatory, but you are strongly encouraged to try things out. The examples are in the C language, so knowing the Ritchie’ language is mandatory (we hope that you already know, if you have reached this book). 
All we need to do now, it is just taking off. Seat back, relax, and code.
__Alessia Antelmi__, PhD Student. Department of Computer Science, Università degli Studi di Salerno


# Book outline

1. Introduction. A brief introduction to distributed computing using distributed memory paradigm and MPI.
    - Let's start to have fun with MPI
    - Take the first steps, Hello world
    - The OpenMPI Architecture
    - MPI Programming
    - Chapter Questions
2. Point-to-Point communication. This chapter introduces synchronous and asynchronous communications of the MPI standard.
    - MPI Memory model
    - Blocking Communication
    - Communication Modes
    - Non-Blocking Communication
    - Chapter Questions
3. Datatypes. This chapter introduces Datatypes of the MPI standard.
    - Communicate noncontiguous data
    - Derived Datatypes
    - Chapter Questions
4. Collective communications. This chapter introduces collective communications of the MPI standard.
    - Collective communications Overview
    - MPI Groups
    - MPI Communicators
    - Collective Communications Routines
    - Chapter Questions
5. Communication Topologies. A brief introduction to MPI topologies.
    - MPI Process Topologies
    - Chapter Questions
6. HPC Environment for all. This chapter introduces how to create an MPI cluster machine on Amazon AWS.  
     - MPI Amazon AWS Cluster
     - Docker MPI Environment


# Book features and recommendations

- All arguments are discussed and experimented during the reading by using simple examples in C.
- By using this book you are able to learn in a more dynamic way.
- You can change the example and integrate it with your code to directly experiment with the topic that you have studied.
- Each example run with a fixed number of processors takes in mind this if you change the code.
- Do (and re-do) the chapter questions.


# Book Execution Environment

In this book is used a Docker container that enables to execute in browser MPI program. 
The Docker container is available on public repository on [GitHub](https://github.com/spagnuolocarmine/docker-mpi). The execution environment provides an Ubuntu 18.04 linux machine and several softwares. The execution environments provide the last version of [OpenMPI](https://www.open-mpi.org/), the MPI implementation used in this book. 

You can build your local docker to experiment on your local machine varying the number of MPI processes, by pull from the official Docker registry the image:  docker pull ```spagnuolocarmine/docker-mpi:latest```. Or you can build the docker image by yourself:

```
git clone https://github.com/spagnuolocarmine/docker-mpi.git
cd docker-mpi
docker build --no-cache -t dockermpi .
docker run -it -t dockermpi:latest
```

# References

1. Peter Pacheco. 2011. An Introduction to Parallel Programming (1st ed.). Morgan Kaufmann Publishers Inc., San Francisco, CA, USA.
2. Kai Hwang, Jack Dongarra, and Geoffrey C. Fox. 2011. Distributed and Cloud Computing: From Parallel Processing to the Internet of Things (1st ed.). Morgan Kaufmann Publishers Inc., San Francisco, CA, USA.
3. Czech, Z. (2017). Introduction to Parallel Computing. Cambridge: Cambridge University Press.
4. Blaise Barney, Lawrence Livermore National Laboratory, Message Passing Interface (MPI) -- https://computing.llnl.gov/tutorials/mpi/#What
5. MPI: A Message-Passing Interface Standard -- https://www.mpi-forum.org/docs/mpi-2.2/mpi22-report.pdf
7. MPI: A Message-Passing Interface Standard -- https://www.mpi-forum.org/docs/mpi-3.1/mpi31-report.pdf
8. Wilson Greg, Kristian Hermansen. 2011. The Architecture of Open Source Applications, Volume II.
9. https://www.rookiehpc.com/mpi/docs/index.php
10. Beginning MPI (An Introduction in C)
11. Virtual Workshop Cornell -- https://cvw.cac.cornell.edu/MPIP2P
12. MPI by Blaise Barney, Lawrence Livermore National Laboratory -- https://computing.llnl.gov/tutorials/mpi/
13. https://mpitutorial.com/tutorials/mpi-broadcast-and-collective-communication/
14. https://mpi.deino.net

# Suggested readings

- Peter Pacheco. 2011. An Introduction to Parallel Programming (1st ed.). Morgan Kaufmann Publishers Inc., San Francisco, CA, USA.
- Czech, Z. (2017). Introduction to Parallel Computing. Cambridge: Cambridge University Press.
- Maurice Herlihy and Nir Shavit. 2008. The Art of Multiprocessor Programming. Morgan Kaufmann Publishers Inc., San Francisco, CA, USA.
- Andy Oram, Greg Wilson, 2008, Beautiful Code, Leading Programmers Explain How They Think,  O'Reilly Media.
- [Idiomatic Expressions in C By Adam Petersen](https://www.adamtornhill.com/Idiomatic_expressions_in_C.pdf). 
- Mandel Cooper, Advanced Bash Scripting, 2010.

# Acknowledgement

I wish to show my gratitude to Alessia Antelmi for reviewing this manuscript and helping to improve the quality by providing ideas and active support during the drawing up.