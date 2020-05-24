import json

tree = { "name": "root", "children": [] }
ppl = { "root": tree}
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

with open("famtree/famtree.txt", "r") as data:
    for line in data:
        if not line.strip() or line.strip()[0] == '#':
            continue
        fam = [s.strip() for s in line.split(";")]
        big = fam[0]
        littles = fam[1:]
        for little in littles:
            connect(big, little)

with open("famtree/famtree.json", "w") as output:
    json.dump(tree, output)
