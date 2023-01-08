import rawdata from '@/raw.json'

function _filtered_raw(typed) {
    return rawdata.filter((e)=>e._type===typed)
        .map((n)=>{
            if(n._name) {
                n.id = n._name;
            }
            return n;
        });
}

function _extracts(e) {
    return Object.fromEntries(Object.entries(e).filter(([k,])=>!/^_/.test(k)));
}

function _dictionary(mappable, keyFn=(e)=>e._name, vFn=_extracts) {
    let entries = mappable.map((e)=>[keyFn(e), vFn(e)]);
    return Object.fromEntries(entries);
}


const KeyProperty = 'DatatypeProperty';
const KeyCategory = 'Class';
const KeyEntity = 'NamedIndividual'

// base elements
let properties = _filtered_raw(KeyProperty);
let categories = _filtered_raw(KeyCategory);
let entities = _filtered_raw(KeyEntity);



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


// subclass hierarchy
categories
    .forEach((cls)=>{
        cls._child=subclass_of(cls._name)
            .concat(items_of(cls._name));
    });

// build hierarchy
const hierarchy = subclass_of();



function _ep_key(key,val) {
    return `${key}:${val}`; 
} 
function entity_prop(entity, prop) {
    return (entity[prop._name]!=null)
        ? _ep_key(prop._name, entity[prop._name])
        : null;
}

// property-entity affiliation mapping
let semantics = entities.reduce((g,e)=>{
    properties
        .filter((p)=>entity_prop(e,p)!=null)
        .forEach((p)=>{
            let pk = entity_prop(e,p);
            if(g[pk]==null) {
                g[pk] = Object.assign({}, p, {
                    id: pk,
                    _key: p._name,
                    _value: e[p._name],
                    _name: pk,
                    _child: [],
                });
            } 
            g[pk]._child.push(e);            
        });
    return g;
}, {});

function to_string(item) {
    return `[${item._type}] ${item._name}`;
}

// entity-property, class mapping
entities.forEach((en)=>{
    en._props = Object.entries(en)
        .filter(([k,v])=>semantics[_ep_key(k,v)]!=null)
        .map(([k,v])=>semantics[_ep_key(k,v)]);
    // en._child = children;
    // en._child = []; 
});


export default {
    // datatype property, dictionary typed 
    props: _dictionary(categories),
    // datatype property, list tpyed
    properties,
    // class categories, dictionary typed
    categories: _dictionary(categories),
    // class categories, hierarchial
    hierarchy,
    // object entities, dictionary typed
    entities: _dictionary(entities),
    // semantic map
    semantics,
    // key names
    keys: {
        property: KeyProperty,
        category: KeyCategory,
        entity: KeyEntity,
    },
    // 
    to_string,
}