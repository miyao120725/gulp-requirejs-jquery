requirejs = {
    baseUrl: 'js',
    paths: {
        'jquery': 'lib/jquery.min',
        'swiper': 'lib/swiper.min',
        'global': 'common/global.js',
        'nicescroll': 'lib/jquery.nicescroll.js',
        'waterfall': 'lib/jquery.waterfall.js',
    },
    // urlArgs: "v=" +  (new Date()).getTime(),
    shim: {
        'nicescroll': {
            deps: ['jquery']
        },
        'waterfall': {
            deps: ['jquery']
        },
    }
}
