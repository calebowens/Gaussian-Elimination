# Gaussian Elimination
This simple library facilitates the solving of simultaneous equations and finding the
inverse of matrices via Gaussian Elimination.

## Usage

### Simultaneous Equations

Create a Tableau to represent this set of equations

![equations](https://i.imgur.com/uS3ujTa.png[/img)

```ts
import { Tableau } from './main'

const tableau = Tableau.from([
  [[ 2 ,  1 , -1 ], [ 8 ]],
  [[-3 , -1 ,  2 ], [-11]],
  [[-2 ,  1 ,  2 ], [-3 ]],
])
```

Then to solve the equations

```ts
tableau.solve() // Returns [[2, 3, -1]]
```

After solving, to get just the first elements of all right-hand side of the tableau, you can use

```ts
tableau.getLHSFirsts() // Returns [2, 3, -1]
```

### Matrix Inversion

Finding the inverse the above LHS

```ts
import { Tableau } from './main'

const tableau = Tableau.from([
  [[ 2 ,  1 , -1 ], [ 1 , 0 , 0 ]],
  [[-3 , -1 ,  2 ], [ 0 , 1 , 0 ]],
  [[-2 ,  1 ,  2 ], [ 0 , 0 , 1 ]],
])

tableau.solve() // Returns [ [ 4, 3, -1 ], [-2, -2, 1 ], [ 5, 4, -1 ] ]
```