// Edit this file to change the default programs.
// Each level has a name and a list of program titles.
const LEVELS = [
  { name: "Level 1: Basics", items: [
    "Hello World", "Add, subtract, multiply, divide two numbers", "Swap two numbers",
    "Check even or odd", "Check positive, negative, or zero", "Find the largest of 2/3 numbers",
    "Check leap year", "Calculate factorial", "Generate Fibonacci series", "Calculate power of a number" ] },
  { name: "Level 2: Number programs", items: [
    "Check prime number", "Print prime numbers in a range", "Reverse a number", "Check palindrome number",
    "Check Armstrong number", "Check perfect number", "Find GCD/HCF", "Find LCM", "Count digits in a number",
    "Sum of digits", "Product of digits", "Find first and last digit", "Decimal to binary",
    "Binary to decimal", "Fibonacci using recursion" ] },
  { name: "Level 3: Strings", items: [
    "Reverse a string", "Check palindrome string", "Count vowels and consonants", "Count words in a sentence",
    "Count frequency of characters", "Find duplicate characters", "Remove duplicate characters", "Check anagram",
    "Find first non-repeating character", "Find longest word", "Convert lowercase and uppercase",
    "Remove spaces from a string", "Count occurrences of a substring" ] },
  { name: "Level 4: Arrays / lists", items: [
    "Find maximum element", "Find minimum element", "Find second-largest element", "Reverse an array",
    "Calculate sum of array", "Calculate average", "Remove duplicates", "Find duplicate elements",
    "Find missing number", "Count frequency of elements", "Find common elements between two arrays",
    "Merge two arrays", "Sort an array", "Rotate an array", "Move all zeros to the end",
    "Find pair with given sum", "Find maximum subarray sum" ] },
  { name: "Level 5: Searching and sorting", items: [
    "Linear search", "Binary search", "Bubble sort", "Selection sort", "Insertion sort", "Merge sort", "Quick sort" ] },
  { name: "Level 6: Data structures", items: [
    "Stack implementation", "Queue implementation", "Circular queue", "Linked list", "Reverse linked list",
    "Detect cycle in linked list", "Binary tree traversal", "Binary search tree", "Graph representation",
    "BFS", "DFS", "Hash table / HashMap operations" ] },
  { name: "Level 7: Recursion and logic", items: [
    "Factorial using recursion", "Fibonacci using recursion", "Sum of numbers using recursion",
    "Reverse string using recursion", "Tower of Hanoi", "Generate permutations", "Generate subsets", "N-Queens" ] },
  { name: "Level 8: Real-world programs", items: [
    "Calculator", "Number guessing game", "Rock Paper Scissors", "ATM simulation", "Bank management system",
    "Student management system", "Library management system", "Contact management system", "To-do list",
    "Quiz application", "Password generator", "File organizer", "Expense tracker", "Simple login/register system",
    "URL shortener", "Chat application", "Weather application using an API", "CRUD application with database" ] },
];

// Starter code for a few programs (you can edit or add your own in the app).
const STARTERS = {
  "Calculate factorial": `n = 5
fact = 1

for i in range(1, n + 1):
    fact *= i

print(fact)`,
  "Check prime number": `n = 29
is_prime = True

if n < 2:
    is_prime = False
else:
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            is_prime = False
            break

print("Prime" if is_prime else "Not Prime")`,
  "Check anagram": `s1 = "listen"
s2 = "silent"

if sorted(s1) == sorted(s2):
    print("Anagram")
else:
    print("Not Anagram")`,
  "Find second-largest element": `arr = [10, 5, 20, 8, 20]

unique = list(set(arr))
unique.sort()

print(unique[-2])`,
  "Binary search": `arr = [2, 4, 6, 8, 10, 12, 14]
target = 10

left = 0
right = len(arr) - 1

while left <= right:
    mid = (left + right) // 2

    if arr[mid] == target:
        print("Found")
        break
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
else:
    print("Not Found")`,
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export function makeDefaults() {
  return LEVELS.map((lvl) => ({
    id: uid(),
    name: lvl.name,
    items: lvl.items.map((title) => ({
      id: uid(),
      title,
      done: false,
      notes: "",
      code: STARTERS[title] || "",
    })),
  }));
}
