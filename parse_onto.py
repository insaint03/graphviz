from xml.etree import ElementTree as et
from urllib.parse import urlparse
import re
import os.path
import json

_folder_ = os.path.dirname(__file__)
# 기본 입력 파일 경로
_source_ = os.path.join(_folder_, 'ontology.data.owl')
# 기본 출력 파일 경로
# _target_ = os.path.join(_folder_, 'public/onto.json')

# document = et.parse(_source_)
_keypattern = re.compile(r'\{.+\}(?P<key>\w+)')

class entity:
    @classmethod
    def _eKey(cls, k, pt=_keypattern) :
        mk = pt.match(k)
        return mk.group('key') if mk is not None else k
    
    @classmethod
    def _eVal(cls, v):
        mv = urlparse(v)
        return mv.fragment if mv.fragment is not None else v

    @classmethod
    def _eNode(cls, el, *prop):
        ''' Node 에서 정보값을 추출 '''
        tg = cls._eKey(el.tag)
        vs = None
        for k,v in el.items() :
            for p in prop :
                if len(el)<=0 and el.text is not None :
                    vs = el.text
                elif k.endswith(p) :
                    vs = cls._eVal(v)
                try :
                    vs = json.loads(vs)
                except :
                    continue
            if vs is not None :
                break
        return tg, vs

    def __init__(self, el) :
        tag, about = self._eNode(el, 'about')
        self._node = el
        self._items = {k:v for k,v in map(lambda ch:self._eNode(ch, 'resource', 'datatype'), el)}
        # self._tag = tag
        # self._about = about
        self._items.update(**{
            '_type': tag,
            '_name': about,
        })

    @property
    def node(self) : return self._node

    @property
    def attrs(self) : return self._items


    def items(self): return self._items.items()

    def __repr__(self) :
        return '<%s> %s'%(self.tag, self.about)

if __name__ == '__main__' :
    from sys import argv

    source = argv[1] if 1<len(argv) else _source_
    puts = argv[2] if 2<len(argv) else None
    
    document = et.parse(source, parser=et.XMLParser(encoding='utf-8'))
    outs = [entity(n).attrs for n in document.getroot()]

    if puts is not None :
        with open(puts, 'w', encoding='utf8') as w :
            json.dump(outs, w, ensure_ascii=False)
    else :
        print(json.dumps(outs, ensure_ascii=False))