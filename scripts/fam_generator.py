import json

tree = { "name": "root", "children": [] }
ppl = { "root": tree}
parent_dict = {}


def add_person(person_string):
    name, year = [s.strip() for s in person_string.split(",")]
    person = { "name": name,
               "year": "Class of " + year,
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

with open("orgchart.txt", "r") as data:
    for line in data:
        fam = [s.strip() for s in line.split(";")]
        big = fam[0]
        littles = fam[1:]
        for little in littles:
            connect(big, little)

with open("orgchart.json", "w") as output:
    json.dump(tree, output)
