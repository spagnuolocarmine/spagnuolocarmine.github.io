---
layout: posts
title: Counting Sort Sequential vs Parallel
category: news
comments: true
---

Counting sort is an efficient algorithm for sorting an array of elements that each have a nonnegative integer key, for example, an array, sometimes called a list, of positive integers could have keys that are just the value of the integer as the key, or a list of words could have keys assigned to them by some scheme mapping the alphabet to integers (to sort in alphabetical order, for instance). Unlike other sorting algorithms, such as mergesort, counting sort is an integer sorting algorithm, not a comparison based algorithm. 

The complexity of the algorithm is `Theta(n)`.

**An algorithm that maps the following input/output pair is called a sorting algorithm:**

- Input: An array, A, of size  of orderable elements. `A[0,1,...,n-1]`.
- Output: A sorted permutation of A, called B, such that `B[0]<=B[1]..<=B[n-1]`.

### Counting Sort Sequential

Counting sort assumes that each of the _n_  input elements in a list has a key value ranging from _0_ to _k_, for some integer _k_.  For each element in the list, counting sort determines the number of elements that are less than it. Counting sort can use this information to place the element directly into the correct slot of the output array.

Counting sort uses three lists:

- `A[0,1, ...,n]` the input list.
- `B[0,1, ...,n]` the output list.
- `C[0,1, ...,k]` an temporany memory array.


**Algorithm**

- Compute the min and the max of the arrat _A_ in order to define `k= max - min + 1`.
- For all element in `A[i],0<=i<=n-1`, the counting sort, incremente the value `C[A[i]-min]` by one. For instance consider that the value _1_ in the array _A_ appears _8_ times the value `C[1]=8`.
- Update the status of _C_ with `C[i]=C[i]+C[i-1], 1<=i<=k`.
- Sort _A_ in _B_ according to `C[A[i]], 1<=i<=k` and decrement the value of `C[A[i]]` after each update.
 

![Counting Sort](https://spagnuolocarmine.github.io/assets/img/count.gif)

### Counting Sort Parallel


![Counting Sort](https://spagnuolocarmine.github.io/assets/img/coutingpar.png)