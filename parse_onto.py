from xml.etree import ElementTree as et
from urllib.parse import urlparse
import re
import os.path

_folder_ = os.path.dirname(__file__)
# 기본 입력 파일 경로
_source_ = os.path.join(_folder_, 'ontology.data.owl')
# 기본 출력 파일 경로
_target_ = os.path.join(_folder_, 'public/onto.json')

document = et.parse(_source_)
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
                if k.endswith(p) :
                    vs = cls._eVal(v)
                    break
            if vs is not None :
                break
        return tg, vs

    def __init__(self, el) :
        tag, about = self._eNode(el, 'about')
        self._node = el
        self._tag = tag
        self._about = about
        self._items = {k:v for k,v in map(lambda ch:self._eNode(ch, 'resource', 'datatype'), el)}

    @property
    def tag(self) : return self._tag
    
    @property
    def node(self) : return self._node

    @property
    def about(self) : return self._about

    @property
    def attrs(self) : return self._items

    def items(self): return self._items.items()

    def __repr__(self) :
        return '<%s> %s'%(self.tag, self.about)

if __name__ == '__main__' :
    entities = [entity(n) for n in document.getroot()]
    with open('test.out', 'w', encoding='utf8') as fp :
        for e in entities :
            fp.write('\t'.join([e.tag, e.about, str(e.attrs)]))
            fp.write('\n')
