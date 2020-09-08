---
layout: post
title: MPI Find Max Example
category: teaching
---

# Parallel Max of Integer Array

- ```mpicc mpimax.c```
- ```mpirun -np 3 1 1000```
- 1 flag sequential execution (0 for not execute sequential code)
- 10000 is the number of element in the array

```
#include "mpi.h"              /* MPI header file */
#include <stdio.h>
#include <stdlib.h>
#include <sys/time.h>
#define MAX_LEN 100000   /* Max array size */

/* Usual search for largest function  */
int find_max(int a[ ],int len)
{
   int i;   
   int max; /* Current max */
   max = a[0];
   for (i=1;i<len;++i)
		    if (a[i] > max) max = a[i];
   return max;
}

/* Function to generate random ints  */
void generate_data (int a[ ],int len)
{
   int i;
   struct timeval time;
   /* Use time of day to get a seed */
   gettimeofday(&time, (struct timezone *) 0);
   srand((int) time.tv_sec);

   for (i=0;i<len;++i)
      a[i] = rand();
}

int main (int argc, char *argv[])
{
  int my_rank;  
  int rank;    /* Loop variable for the processes */
  int num_proc;     /* Total number of processes */
  int array_len;  /* Length of the main array */
  int sequential; /* Should we do sequential */
  int quotient;  /* Usual subarray size: array_len/num_proc*/
  int rem;  /* How many larger subarrays:
			                   array_len % num_proc */
  int sub_start;  /* Start of one of the subarrays */
  int sub_len;  /* Length of my subarray */
  int search_array[MAX_LEN];  /* The array to search */
  int my_max; /* Max for my subarray */
  int global_max; /* Maximum for the main array */
  int local_max; /* Local max from one process */
  MPI_Status   status;  /* status for receive */

  /* Usual startup tasks */
  MPI_Init(&argc, &argv);     
  MPI_Comm_rank(MPI_COMM_WORLD,&my_rank);
   
   /* Code for Process 0 */
  if (my_rank == 0) {
         sequential = atoi(argv[1]);   /* Sequential 1 - Parallel !=1 */
         array_len = atoi(argv[2]);    /* Array dimension on compute the max*/
         MPI_Comm_size(MPI_COMM_WORLD, &num_proc);

         /* Get values needed for subarray sizes */
         quotient = array_len / num_proc; /*P part of N/P elements*/
         rem = array_len % num_proc; /*Number of processes that need an additional element*/

         generate_data(search_array,array_len);
       
         if (sequential)
            printf("The sequential search gives %d\n",
                      find_max(search_array,array_len));
	
         /* Some subarrays may be larger */
         for (rank=1; rank < rem; ++rank){
             sub_len = quotient+1;
						 /*rank * quotient, is the number of element in the part before your part
							 + rank how many part of size 1 is before you?*/
             sub_start = rank*quotient+rank;
             MPI_Send(&sub_len,1,MPI_INT,rank,0,MPI_COMM_WORLD);
             MPI_Send(&(search_array[sub_start]),sub_len, MPI_INT, 
             rank, 0, MPI_COMM_WORLD);
          }
         for (rank=rem; rank < num_proc; ++rank){
             sub_len = quotient;
						 /*rank * quotient, is the number of element in the part before your part
							 + rem how many part of size 1 is before you?*/
             sub_start = rank*quotient+rem;
               /* Send the process its subarray length */
             MPI_Send(&sub_len,1,MPI_INT,rank,0,MPI_COMM_WORLD);
               /* And send the subarray */
             MPI_Send(&(search_array[rank*quotient+rem]),quotient, 
                                 MPI_INT, rank, 0, MPI_COMM_WORLD);
		 }

		 /* Find my local max */
        if (rem==0)
              sub_len=quotient;
          else sub_len=quotient+1;
        global_max = find_max(search_array,quotient+1);

        /* Get back the maxima from the others */
        for (rank=1;rank<num_proc;++rank){
             MPI_Recv(&local_max,1,MPI_INT,MPI_ANY_SOURCE,0,
                            MPI_COMM_WORLD, &status);
             if (local_max > global_max)
                  global_max = local_max;
        }
        /* Display the global max */
        printf("The parallel search gives %d\n", global_max);
    }
   else {    /* Code for other processes */
	 /* Receive my subarray length */
        MPI_Recv(&sub_len,1,MPI_INT,0,0,MPI_COMM_WORLD,&status);
		/* And receive the subarray */
        MPI_Recv(search_array,sub_len,MPI_INT,0,0,MPI_COMM_WORLD,
				 &status);
        my_max = find_max(search_array,sub_len);
        /* Send back my local max */
	    MPI_Send(&my_max,1,MPI_INT,0,0,MPI_COMM_WORLD);
    }
         
               
  MPI_Finalize();              /* And close up MPI  */
	return 0;
}
```