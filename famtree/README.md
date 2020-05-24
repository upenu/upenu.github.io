# UPE Family Tree


## Summary
Records of the UPE Big Little Program, and its many past variations, have largely been scattered across Google sheets from past semesters. This is unfortunate because it hinders us from maintaining institutional memory and from remaining connected, both spiritually and in fact, with our predecessors. We wanted to create a page where people can visualize and appreciate the social web of our honor society.

## Goals
1. Maintainability
   The process for updating the chart must be as simple as possible so that this task doesn't become burdensome for future generations.
2. Scalability
   The family tree must be able to display hundreds, potentially thousands, of nodes.
3. Visual Appeal
   The tree must be visually appealing enough that people would be willing to look at it :)

## Implementation
This page uses the [jQuery plugin OrgChart, by dabeng](https://github.com/dabeng/OrgChart). We chose this existing library because it does pretty much exactly what we want and more. Its many optional features include panning and zooming, allowing us to view a large number of nodes, fulfilling our Scalability goal. It also gives us the option to extensively customize the styles to suit our preferences, giving us the flexibility to optimize for Visual Appeal.

However, the plugin originally required users to provide data via a JSON object. We realized that this could become quite untenable from a maintainability perspective as we expanded the tree. Our solution is to store the big/little relationships in a txt file of the following format.

```
Big1's Name, GradYear; Little1's Name, GradYear; Little2's Name, GradYear...
Big2's Name, GradYear; Little1's Name, GradYear; Little2's Name, GradYear...
Big3's Name, GradYear; Little1's Name, GradYear; Little2's Name, GradYear...
...
```
In each row, the big's name and graduation year are first, then each little's name and grad year follow, delimited by semicolons. Commas separate name and year. There can be as many littles per row as desired, and a big can exist on multiple lines. Note that the graduation year is optional.

Whenever we update the txt file, we run a script, fam_generator.py, that converts the txt into the desired JSON object. This JSON is read by the plugin. The format of our JSON is as follows:
```
{
    "id": "First Last, Grad Year",
    "name": "First Last",
    "year": "Grad Year",
    "children": [...]
}
```

## Edge Cases
There exists an unfortunate case where a little may have 2 bigs. This was the case in Spring 2019, where big/little families consisted of 2 bigs and 4 littles. If we were to draw lines from littles to multiple bigs, this would significantly decrease the quality of our diagram. In the future, we will likely abide by the format used in Spring 2020, in which each little has only 1 big. As a workaround for the Spring 2019 data, however, we have created the following solution: for each family of 2 bigs and 4 littles
```
Big1, Big2, Little1, Little2, Little3, Little4
```
We choose to create the following entries in famtree.txt:
```
Big1, Little1, Little2
Big2, Little3, Little4
Big1, Little3 (co), Little4 (co)
Big2, Little1 (co), Little2 (co)
```

The downside to this approach is that littles from Spring 2019 will see their names printed twice on the diagram, the second time with "(co)" printed after their name. The upside is that all family relationships are maintained without needing to destroy the visual quality of the tree or combine nodes.
