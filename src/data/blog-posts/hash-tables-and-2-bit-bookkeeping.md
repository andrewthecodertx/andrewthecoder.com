---
title: "Understanding Hash Tables and 2-Bit Bookkeeping"
slug: "hash-tables-and-2-bit-bookkeeping"
publishDate: "2025-08-01"
description: "A deep dive into hash tables, using a C implementation as an example, and an explanation of the memory-saving '2-bit bookkeeping' technique."
categories: ["Software Development"]
tags: ["c", "c++", "data structures", "hash table"]
author: Andrew
comments_enabled: true
featured: false
---

This document provides an explanation of hash tables, using the implementation
in this project as a practical example. It also details the memory-saving
"2-bit bookkeeping" technique used in this C implementation and compares the
approach to modern C++.

## What is a Hash Table?

A hash table is a data structure that maps **keys** to **values**. It is one
of the most efficient data structures for inserting, deleting, and looking up
data. Think of it like a dictionary: you look up a word (the key) to find its
definition (the value).

The core components are:

1. **Keys**: Unique identifiers for the data you want to store.

1. **Values**: The data associated with each key.

1. **Hash Function**: A function that takes a key and computes an integer
    value called a "hash." This hash is used to determine where in memory the
    value should be stored.

1. **Buckets**: An array of slots where data is stored. The hash determines
    which bucket an entry belongs to.

When you insert a key-value pair, the hash table uses the hash function on the
key to calculate an index in its internal array. The value is then stored at
that index. When you want to look up a key, it re-calculates the hash to find
the index and retrieve the value.

A "collision" occurs when two different keys produce the same hash index. This
project uses **open addressing** with **linear probing** to resolve this: if a
slot is taken, it simply checks the next slot, and the next, until it finds an
empty one.

## The C Implementation: A Deep Dive

This project implements a generic hash table in C. Because C does not have
templates like C++, it achieves genericity using `void*` pointers and a
`type_handler` struct containing function pointers.

```c
// from: hashtable.h

// Defines the set of functions required for managing a type.
typedef struct {
    copy_function    copy;    // How to copy an element
    destroy_function destroy; // How to free an element
    key_equal_function equal; // How to compare two keys
    hash_function    hash;    // How to hash a key
} type_handler;
```

The user must provide these functions for their specific data types, giving them
full control over memory and behavior.

### The "2-Bit Bookkeeping" Optimization

A key challenge in hash table design is managing the state of each slot
(bucket) efficiently. A slot can be:

- `EMPTY`: Has never been used.
- `OCCUPIED`: Contains a valid key-value pair.
- `DELETED`: Previously held data that was removed (a "tombstone").

A naive approach would store a state flag inside each entry struct, often
using an entire `int` or `char` (8 bits). This project uses a much more
memory-efficient technique.

It maintains a separate `control_bytes` array. Each single byte in this array
holds the state for **four** different entries. Each state is encoded using
just **2 bits**:

- `00` (binary) -> `STATE_EMPTY`
- `01` (binary) -> `STATE_OCCUPIED`
- `10` (binary) -> `STATE_DELETED`

This reduces the memory overhead for metadata to just 2 bits per slot, a 75%
saving compared to using a full byte per slot.

Here is the code that retrieves the state for a given entry index:

```c
// from: hashtable.c

static uint8_t get_state(const HashTable* table, size_t index) {
    // Each byte holds 4 states. Find which byte to look in.
    size_t byte_index = index / 4;
    // Find the 2-bit offset within that byte.
    size_t bit_offset = (index % 4) * 2;
    // Shift and mask to isolate the 2 bits.
    return (table->control_bytes[byte_index] >> bit_offset) & 0b11;
}
```

This is a clever, low-level optimization that is characteristic of high-
performance C code.

## Comparison with C++

C++ makes using hash tables much simpler thanks to its Standard Template
Library (STL) and template system. The equivalent of this project's `HashTable`
is `std::unordered_map`.

Let's compare creating and using a hash table in this C project versus C++.

### C Example (from `main.c`)

In C, you must manually define the data types and then create handler functions
for hashing, equality, copying, and destruction.

```c
// 1. Define the key and value types
typedef struct { int id; char name[32]; } user_key;
typedef struct { double value; char metadata[64]; } user_value;

// 2. Implement handler functions (hash_user_key, equal_user_key, etc.)
uint64_t hash_user_key(const void* key) { /* ... */ }
bool equal_user_key(const void* key1, const void* key2) { /* ... */ }
// ... other handlers ...

// 3. Assemble the handlers and create the table
type_handler key_handler = { /* .copy, .destroy, .equal, .hash */ };
type_handler value_handler = { /* .copy, .destroy */ };
HashTable* my_table = hash_table_create(key_handler, value_handler, NULL);

// 4. Insert data
user_key k1 = {101, "alpha"};
user_value v1 = {3.14, "First item"};
hash_table_insert(my_table, &k1, &v1);
```

#### C++ Equivalent

In C++, templates and operator overloading handle most of this automatically.
You define a custom hash function and equality operator for your struct, and
the container does the rest.

```cpp
#include <iostream>
#include <string>
#include <unordered_map>

// 1. Define the key and value types
struct UserKey {
    int id;
    std::string name;

    // Equality operator
    bool operator==(const UserKey& other) const {
        return id == other.id && name == other.name;
    }
};
struct UserValue { double value; std::string metadata; };

// 2. Specialize the hash function for the custom key type
namespace std {
    template <>
    struct hash<UserKey> {
        size_t operator()(const UserKey& k) const {
            // Combine hashes of members
            return hash<int>()(k.id) ^ (hash<string>()(k.name) << 1);
        }
    };
}

int main() {
    // 3. Create the table
    std::unordered_map<UserKey, UserValue> myMap;

    // 4. Insert data
    myMap.insert({ {101, "alpha"}, {3.14, "First item"} });
}
```

### Conclusion

The C++ approach is less verbose, more type-safe, and less prone to manual
memory management errors. However, the C implementation in this project
demonstrates that C gives a programmer unparalleled control to make specific,
low-level optimizations like the 2-bit bookkeeping strategy, which can be
critical in memory-constrained environments.
