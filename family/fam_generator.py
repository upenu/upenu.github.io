import json
import random
import sys
from collections import deque

tree = { "name": "Nu Chapter", "year": "Founded in 1995", "children": [] }
ppl = { "Nu Chapter, Founded in 1995": tree}
parent_dict = {}


def add_person(person_string):
    data = [s.strip() for s in person_string.split(",")]
    name = data[0]
    if len(data) > 1:
        year = "Class of " + data[1]
    else:
        year = ""
    person = { "name": name,
               "year": year,
               "children": [] }
    ppl[person_string] = person
    tree["children"].append(person)
    parent_dict[person_string] = tree

def get_person(person_string):
    return ppl[person_string]

def detach(little_string):
    assert little_string in ppl, "little does not exist"
    little = get_person(little_string)
    big = parent_dict[little_string]
    del parent_dict[little_string]

    big["children"].remove(little)

def connect(big_string, little_string):
    if big_string not in ppl:
        add_person(big_string)
    if little_string not in ppl:
        add_person(little_string)
    big = get_person(big_string)
    little = get_person(little_string)

    detach(little_string)
    big["children"].append(little)
    parent_dict[little_string] = big

with open("famtree.txt", "r") as data:
    shuffled_data = list(data)
    random.shuffle(shuffled_data)
    for line in shuffled_data:
        if not line.strip() or line.strip()[0] == '#':
            continue
        fam = [s.strip() for s in line.split(";")]
        big = fam[0]
        littles = fam[1:]
        for little in littles:
            connect(big, little)

fams = tree["children"]
fams.sort(key=lambda x: -len(repr(x)))
new_fams = deque()
for i in range(0, len(tree["children"]), 2):
    new_fams.appendleft(fams[i])
    if i + 1 < len(fams):
        new_fams.append(fams[i + 1])
assert(len(fams) == len(new_fams))
tree["children"] = list(new_fams)
for fam in tree["children"]:
    [print("1", end="") for x in range(len(repr(fam))//10)]
    print()

with open("famtree.json", "w") as output:
    json.dump(tree, output)
