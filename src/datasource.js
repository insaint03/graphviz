import rawdata from '@/raw.json'

function _filtered_raw(typed) {
    return rawdata.filter((e)=>e._type===typed);
}

function _extracts(e) {
    return Object.fromEntries(Object.entries(e).filter(([k,])=>!/^_/.test(k)));
}

function _dictionary(mappable, keyFn=(e)=>e._name, vFn=_extracts) {
    let entries = mappable.map((e)=>[keyFn(e), vFn(e)]);
    return Object.fromEntries(entries);
}


// base elements
let properties = _filtered_raw('DatatypeProperty');
let categories = _filtered_raw('Class');
let entities = _filtered_raw('NamedIndividual');

function subclass_of(class_name=null) {
    return categories
        .filter((c)=>c.subClassOf==class_name) 
    || [];
}


function items_of(class_name) {
    return entities
    .filter((e)=>e.type == class_name)
    || [];
}

categories
    .forEach((cls)=>cls._child=subclass_of(cls._name).concat(items_of(cls._name)));
// entities

// build hierarchy
let hierarchy = subclass_of();

export default {
    properties: properties,
    // properties: _dictionary(properties),
    categories: _dictionary(categories),
    entities: _dictionary(entities),
    hierarchy,
    // cursor,
    // selecteds,
}