---
layout: page
title: Programmazione concorrente, parallela e su cloud
description: Laurea Magistrale in Informatica 
img: assets/img/parallelProblem.gif
importance: 2
category: work
giscus_comments: false
redirect: https://spagnuolocarmine.github.io/programmazione-concorrente-parallela-cloud
---


#### Master Degree Course of prof. Vittorio Scarano and Carmine Spagnuolo, Ph.D.
##### Università degli Studi di Salerno
--------------------------------------------------------------------------------------------------
<!--
# Syllabus and Course Schedule 2019
_*Note B is Book and C is Chapter_
| Event |  Date | Description | Materials and Assignments |  
|---|---|---|---|
|Lecture 1 | 02/04| Introduction to Cloud Computing 1 | B1: C1 | 
|Lecture 2 | 11/04| Introduction to Cloud Computing 2 | B1: C2-C3.1| 
|Lecture 3 | 11/04| Introduction to Amazon Web Services | [pdf](https://spagnuolocarmine.github.io/assets/files/aws-overview.pdf) | 
|Lecture 4 | 12/04| Amazon Web Service Practice |[pdf](https://spagnuolocarmine.github.io/assets/files/01_02_PCPC_Amazon_Practice_Labs_2019.pdf)|
|Lecture 5 | 16/04| Modelli ed Architetture per il Calcolo Parallelo + Metriche per il Calcolo Parallelo| B2: C2.1-C2.2-C5.1-C5.3-C5.4 C3.1-C3.2 [slide2](https://spagnuolocarmine.github.io/assets/files/04_PCPC_Metrics_of_Parallel_Algorihtm.pdf) |
|Lab 6      | 18/04| Amazon Web Service Lab |  | 
|Lecture 7 | 30/04| Algoritmi per memoria condivisa + Progettazione di Algoritmi Paralleli| B2: C3.5.1-C3.5.4-C3.5.5 - [counting sort](https://spagnuolocarmine.github.io/news/counting-sort/) - [slide1](https://spagnuolocarmine.github.io/assets/files/05_PCPC_Algorithms_for_shared_memory.pdf) - [slide2](https://spagnuolocarmine.github.io/assets/files/06_Design_of_Parallel_Algorithm.pdf)|
|Lecture 8  | 02/05| Message-passing Programming Teoria 1 | [MPI 2.2](https://www.mpi-forum.org/docs/mpi-2.2/mpi22-report.pdf) CAP 1-2 - [OpenMPI](https://www.open-mpi.org/)  | 
|Lab 9      | 03/05| Message-passing Programming |  | 
|Lecture 10 | 07/05| Message-passing Programming Teoria 2 | [MPI 2.2](https://www.mpi-forum.org/docs/mpi-2.2/mpi22-report.pdf) CAP 3 - [Idiomatic C](http://icube-icps.unistra.fr/img_auth.php/d/db/ModernC.pdf) - [MPI's send modes](https://www.mcs.anl.gov/research/projects/mpi/sendmode.html) - [MPI Performance](https://computing.llnl.gov/tutorials/mpi_performance/)| 
|Lab 11     | 09/05| Message-passing Programming  |  | 
|Lab 12 | 10/05| Message-passing Programming |  | 
|Lecture 13     | 14/05| Message-passing Programming Teoria 3  | [MPI 2.2](https://www.mpi-forum.org/docs/mpi-2.2/mpi22-report.pdf) Cap 5 | 
|Lab & Project 14 | 16/05| Project Presentation |  | 
|Project 15 | 17/05| Lab Project |  | 
|Project 16 | 21/05| Lab Project |  | 
|Lecture 17 | 23/05| Introdution to FLY |  |
|Lecture 18 | 24/05| FLY Lab |  |
--->

## Books and References

1. Kai Hwang, Jack Dongarra, and Geoffrey C. Fox. 2011. Distributed and Cloud Computing: From Parallel Processing to the Internet of Things (1st ed.). Morgan Kaufmann Publishers Inc., San Francisco, CA, USA.
2. Czech, Z. (2017). Introduction to Parallel Computing. Cambridge: Cambridge University Press.

# Materials for online course
- 📅 02/03/2020
    - [📄 AWS Overview](https://spagnuolocarmine.github.io/assets/files/pcpc2020/aws-overview.pdf)
    - [📄 Slides Part A](https://spagnuolocarmine.github.io/assets/files/pcpc2020/02032020_a.pdf)
    - [📄 Slides Part B](https://spagnuolocarmine.github.io/assets/files/pcpc2020/02032020_b.pdf)
- 📅 16/03/2020
    - [📄 Slides](https://spagnuolocarmine.github.io/assets/files/pcpc2020/16032020.pdf)
    - [![Public class chat https://gitter.im/isislab-unisa/pcpc2020](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/isislab-unisa/pcpc2020?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


## Class Question Forum

We use issues on [GitHub](https://github.com/spagnuolocarmine/spagnuolocarmine.github.io/issues). Please use it for sharing ideas and issues on both theoretical and practical course part.

-------------------------------------------------------------------------------------------------

# Which is my course homework?

Each student must develop a solution for the assigned homework using Hybrid parallel programming approach, exploiting shared and distributed memory. The solution must be written in C programming language exploiting OpenMPI and OpenMP, using point-to-point and/or collective communication and all OpenMP features. The developed solution must experiment on a homogeneous cluster scenario. 

The cluster must be created on the Amazon Web Services using a supported [AWS Educate Instances](https://s3.amazonaws.com/awseducate-starter-account-services/AWS_Educate_Starter_Accounts_and_AWS_Services.pdf). The obtained results must be presented in terms of [strong and weak scalability](https://www.sharcnet.ca/help/index.php/Measuring_Parallel_Scaling_Performance), varying the number of computing processors from _1_ to _NUMBER-OF-VCPU-FOR-INSTANCE-TYPE_ _x_ _NUMBER-OF-INSTANCES_. For instance if we run a cluster machine of _4_ t2.large (2 VCPU) nodes, we experimente the scalability of our solution for P={1,2,4,5,6,7,8}.
 

The total number of processors is equal to the number of Virtual CPU on the running instances. The benchmark must exploit **8** instances for the bigger experiment. The student must describe the solution and the benchmark in a README file, written in Markdown, and included in the submission. The README file must describe also the compilation phase and how to reproduce the results obtained.

#### Homeworks

| Name |  Description | Details | 
|---|---|---|
| _gameoflife_ | Conway's Game of Life Game |[link](gol)|
| _jacobi_ |  Simple Jacobi iteration |[link](jacobi)|
| _matrixmultiplication_  |  Parallel matrix multiplication |[link](matrix)|
| _nbody_|  n-body problem |[link](nbody)|
| _pi_ |  Compute in parallel an approximation of PI |[link](pi)|
| _wordscount_ | Compute the frequency of words in a set of files |[link](wordscount)|

#### Amzon Web Services educate supported instances

1. t2.small
2. t2.large
3. t2.xlarge
4. t2.2xlarge
5. m4.large
6. m4.xlarge


### Give me a project now!
 
Compute the MD5 of your name, surname, and birth date, ```md5(namesurnamedate)```:

- the first character in the MD5 is the homework;
- the last character in the MD5 is the AWS EC2 instance type for your cluster environment.

Characters table conversion (use case insentive):

| Character |Value|
|---|---|
|a-g-m-s-y-4|1|
|b-h-n-t-z-5|2|
|c-i-o-u-0-6|3|
|d-j-p-v-1-7|4|
|e-k-q-w-2-8|5|
|f-l-r-x-3-9|6|

**Example** Alice Wonderland 01/01/1865, your assignment is _alicewonderland01011865_, ```md5(alicewonderland01011865)=89820e2ce860966ccd9165e4029035e7```, that is solve the _pi_ problem on _t2.2xlarge_ instances.


### Prepare your submition

Each solution folder must contain the C sources and a report Readme file (in Markdown format) describing all benchmarks (expressed in terms of strong and weak scalability) of the application. Solutions without the Readme file or that cannot easily compile using mpicc will be not considered.

In your home project directory archives your project:
```
tar -cvf solution.tar.gz *
```
Extract your project:
```
tar -xvf solution.tar.gz
```

### Submit a solution

Each solution should be compliant with the problem project template. You can submit a solution via mail to cspagnuolo+PCPC-2019@unisa.it. The submitted file should be a compressed directory using tape archive.


### Homework Evaluation Criteria

Homeworks are evaluated on a range of 30 total points. The final score is diveded in four level:

- **A** [30-28]
- **B** [27-25]
- **C** [24-22]
- **D** [21-18]

#### Points

- **Correctness**. 0 to 10 points. Measures the student's commitment to develop a solution that is compliant with the problem requirement (obviously!). But also solution that solve part of the problem can be evaluated, if it is clear that only minor part of the problem are not correctly solved.
- **Style**. 0 to 10 points. Measures the student's commitment to develop a solution styling it and exploiting all features of MPI and C language, paying attention to use arguments of the parallel and concurrent computing fundamental part. Moreover, the ability to use other MPI features not presented during the course will be evaluated (ref.  Cap 4-6-7 [MPI 2.2](https://www.mpi-forum.org/docs/mpi-2.2/mpi22-report.pdf)).
- **Problem evaluation and Benchamrks**. 0 to 10 points. Measures the student's commitment to undestand the problem and give a good solution, moreover, mesures the student's commitment to presents benchamrks.
- **Lateness**. The total score is decreased by 5% each day, until a 40% eight days or more late. The homework _must_ be subitted for review 8 days before the exam date.

#### Benchmarks TIPS 

Present your results in terms of strong and week scalability:

- **Strong Scalability**: How fast the problem size must increase in order to maintain a fixed efficiency when the number of
processes is increased. In practice the total problem size stays the same as the number of processors increases.  Goal: Minimize time to solution for a given problem.
- **Weak Scalability**: How fast the efficiency decreases when the number of processes increases but the problem size is fixed. In practice  the problem size increases at the same rate as the number of processors, keeping the amount of work per processor equal. Goal: solve the larger problems.


-------------------------------------------------------------------------------------------------------------------------

# How benchmark your applications on a AWS? 

### Cluster Computing Scenario 

- 1 Master Node, where we develop and compile our program for all cluster node.
- N Slaves, where we run the MPI program to execute benchmarks. 

### Our computing environment Ubuntu with OpenMPI and OpenMP

For our purposes we need a Linux machine running OpenMPI and OpenMP. The [repository](https://github.com/spagnuolocarmine) provides installation scripts to build our computing environment on a Ubuntu Machine.


### Configure a MPI cluster of two istances?

Here is described how to execute and manually configure a cluster of two t2.micro instances using the AWS WebConsole.

1. Create a new key-pair and store it on your local machine, suppose that the name of the key is _kcluster_.
2. Start two new t2.micro instances using the Ubuntu AMI (ami-0f65671a86f061fcd) and select the _kcluster_ key-pair, additionally rename it as _master_ and _slave0_. Set a new rule to the default security group that allows to open all TCP ports (0-65535) from anywhere (you can do it in the Configure Security Group tab).
3. Execute on the _master_ node the command ```ssh-keygen`` in order to generate new ssh key pairs for configure the access to the cluser. Note. By using this command without parameters the key is stored in the folder .ssh, in the file id_rsa e id_rsa.pub.
4.  Download and your local machine the [install.sh](https://github.com/spagnuolocarmine/ubuntu-openmpi-openmp/blob/master/install.sh) script and change the SSH key pairs using the previous generated key.
5. Copy the install.sh using SCP on all nodes ```scp -i kcluster install.sh ubuntu@ec2-34-207-88-239.compute-1.amazonaws.com:```.
6. Connect via SSH ```ssh -i kcluster_ubuntu@ec2-34-207-88-239.compute-1.amazonaws.com:``` and execute install.sh on all nodes.



------------------------------------------------------------------------------------------------

# Test an MPI and OpenMP Program

Follow these steps in order to create and test a Hello World MPI program. Consider that you are logged as pcpc user on the master node.

- Create a new MPI program

```vim hello.c```

- HelloWorld MPI program

```
#include <stdio.h>
#include "mpi.h"
#include <omp.h>

int main(int argc, char *argv[]) {
  int numprocs, rank, namelen;
  char processor_name[MPI_MAX_PROCESSOR_NAME];
  int iam = 0, np = 1;

  MPI_Init(&argc, &argv);
  MPI_Comm_size(MPI_COMM_WORLD, &numprocs);
  MPI_Comm_rank(MPI_COMM_WORLD, &rank);
  MPI_Get_processor_name(processor_name, &namelen);

  #pragma omp parallel default(shared) private(iam, np)
  {
    np = omp_get_num_threads();
    iam = omp_get_thread_num();
    printf("Hello from thread %d out of %d from process %d out of %d on %s\n",
           iam, np, rank, numprocs, processor_name);
  }

  MPI_Finalize();
}
```
- Compile the MPI program 
```mpicc -fopenmp hello.c -o hello```
- Copy on all cluster machine the compiled program
```scp hello IP_SLAVE:```
- Run the program on the cluster
```mpirun -np 4 --host MASTER,IP_SLAVE1,IP_SLAVE2 ./hello```

------------------------------------------------------------------------------------------------
<!--
### Project Request
<iframe src="https://docs.google.com/forms/d/e/1FAIpQLScw6qbFwtbFc0EaCc4iLRTyo_1H46uWiDc-JMsGI0-3au1u1A/viewform?embedded=true" width="640" height="1239" frameborder="0" marginheight="0" marginwidth="0">Caricamento in corso...</iframe>

-->
