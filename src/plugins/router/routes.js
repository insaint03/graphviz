// const _route = (name, path, scr, icon) => {
//     return {
//         path,
//         name,
//         icon,
//         component: import(`@/views/${scr}.vue`),
//     };
// }
// import homeScreen from '@/components/HelloWorld'
import searchScreen from '@/views/Search'
import aboutScreen from '@/views/About'

export default [
    {name: 'search', path: '/', component: searchScreen, icon: 'mdi-magnify' },
    {name: 'about', path: '/about', component: aboutScreen, icon: 'mdi-information-outline'},
    // _route('hello', '/', 'HelloWorld', 'mdi-home'),
    // _route('search', '/search', 'Search', 'mdi-maginfy'),
    // _route('about', '/about', 'About', 'mdi-information-outline'),
];