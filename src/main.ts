type Tuple<T, Length extends number> = [T, ...T[]] & { length: Length }

/**
 * Returns a new array containing the indices where the predicate is true.
 *
 * @param array The target array
 * @param predicate The filter function
 */
function findAllIndices<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): number[] {
  return array.map((value, index) => predicate(value, index, array) ? index : undefined)
    .filter(((value) => value !== undefined)) as number[]
}

// Credit: https://stackoverflow.com/a/37580979
function* permute<T>(permutation: T[]) {
  yield permutation.slice()

  const length = permutation.length
  let c = new Array(length).fill(0)
  let i = 1

  while (i < length) {
    if (c[i] < i) {
      let k = i % 2 && c[i]
      let p = permutation[i]
      permutation[i] = permutation[k]
      permutation[k] = p
      ++c[i]
      i = 1
      yield permutation.slice()
    } else {
      c[i] = 0
      ++i
    }
  }
}


export class Tableau<LHSWidth extends number, RHSWidth extends number> {
  constructor(private rows: Tuple<Row<LHSWidth, RHSWidth>, LHSWidth>) {
    if (this.height <= 1) {
      throw "Invalid row count"
    }

    if (this.lhsWidth !== this.height) {
      throw "Row LHS width must equal amount of rows to make a square matrix"
    }

    this.orderRows()

  }

  /**
   * Constructs a tableau from nested arrays
   *
   * @param input
   */
  static from<LHSWidth extends number, RHSWidth extends number>(
    input: Tuple<[Tuple<number, LHSWidth>, Tuple<number, RHSWidth>], LHSWidth>
  ) {
    return new Tableau<LHSWidth, RHSWidth>(
      input.map(([lhs, rhs]) =>
        new Row(
          new RowSide(lhs),
          new RowSide(rhs)
        )
      ) as Tuple<Row<LHSWidth, RHSWidth>, LHSWidth>
    )
  }

  /**
   * Solves the set of equations. Returns the output
   */
  solve(): Tuple<Tuple<number, RHSWidth>, LHSWidth> {
    for (let i = 0; i < this.height; ++i) {
      this.rows[i].divideBy(this.rows[i].lhs.values[i])

      for (let j = this.height - 1; j > i; --j) {
        this.rows[j].subtractMultiple(
          this.rows[i],
          this.rows[j].lhs.values[i]
        )
      }
    }

    for (let i = 0; i < this.height; ++i) {
      if (this.rows[i].lhs.values[i] === 0) {
        throw "LHS is singular and unsolvable"
      }
    }

    for (let i = this.height - 1; i >= 0; --i) {
      for (let j = 0; j < i; ++j) {
        this.rows[j].subtractMultiple(
          this.rows[i],
          this.rows[j].lhs.values[i]
        )
      }
    }

    return this.rows.map(
      (row) => row.rhs.values
    ) as Tuple<Tuple<number, RHSWidth>, LHSWidth>
  }

  /**
   * Gets the left-hand side of the tableau
   */
  getLHS(): Tuple<Tuple<number, RHSWidth>, LHSWidth> {
    return this.rows.map(
      (row) => row.rhs.values
    ) as Tuple<Tuple<number, RHSWidth>, LHSWidth>
  }

  /**
   * Gets the first elements of the left-hand side of the tableau.
   */
  getLHSFirsts(): Tuple<number, LHSWidth> {
    return this.rows.map((row) => row.rhs.values[0]) as Tuple<number, LHSWidth>
  }

  /**
   * Prints out the Tableau
   */
  inspect() {
    console.log(this.rows.map((row) => [row.lhs.values, row.rhs.values]))
  }

  /**
   * The LHS matrix needs to have the y=-x entries be non-zero
   * @private
   */
  private orderRows() {
    for (let permutation of permute(this.rows)) {
      let validPermutation = true

      for (let i = 0; i < this.height; ++i) {
        if (!permutation[i].validIndices.includes(i)) {
          validPermutation = false
        }
      }



      if (validPermutation) {
        this.rows = permutation as Tuple<Row<LHSWidth, RHSWidth>, LHSWidth>

        return
      }
    }

    throw "Unable to order LHS to solve system"
  }

  private get lhsWidth(): LHSWidth {
    return this.rows[0].lhsWidth
  }

  private get rhsWidth(): RHSWidth {
    return this.rows[0].rhsWidth
  }

  private get height(): LHSWidth {
    return this.rows.length
  }
}

/**
 * Is used to build the rows of a Tableau
 */
export class Row<LHSWidth extends number, RHSWidth extends number> {
  constructor(public lhs: RowSide<LHSWidth>, public rhs: RowSide<RHSWidth>) {
  }

  subtractMultiple(row: Row<LHSWidth, RHSWidth>, multiple: number) {
    this.lhs.subtractMultiple(row.lhs, multiple)
    this.rhs.subtractMultiple(row.rhs, multiple)
  }

  divideBy(multiple: number) {
    this.lhs.divideBy(multiple)
    this.rhs.divideBy(multiple)
  }

  get lhsWidth(): LHSWidth {
    return this.lhs.values.length
  }

  get rhsWidth(): RHSWidth {
    return this.rhs.values.length
  }

  get validIndices() {
    return findAllIndices(this.lhs.values, (value) => value !== 0)
  }
}

/**
 * Is used to build a Row
 */
export class RowSide<Width extends number> {
  constructor(public values: Tuple<number, Width>) {
  }

  subtractMultiple(rhs: RowSide<Width>, multiple: number) {
    this.values = this.values.map(
      (value, index) => value - rhs.values[index] * multiple
    ) as Tuple<number, Width>
  }

  divideBy(multiple: number) {
    this.values = this.values.map((value) => value / multiple) as Tuple<number, Width>
  }
}