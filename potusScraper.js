const axios = require('axios');
const cheerio = require('cheerio');
const url = [
    'https://wallpaperscraft.ru/catalog/nature',
    'https://wallpaperscraft.ru/catalog/city',
    'https://wallpaperscraft.ru/catalog/flowers'
];
const httpGetWallpaper = 'https://wallpaperscraft.ru/';


const arrayOfPromises = url.map(url => {
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then(function (response) {
                const $ = cheerio.load(response.data);
                const maxPage = +($('.pager__item.pager__item_last-page .pager__link').attr('href').split('/')[3].split('page')[1]);
                const newPage = Math.floor(Math.random() * maxPage + 1);
                resolve(`${url}/page${newPage}`)
            })
            .catch(function (error) {
                reject(error)
            })
    })
});

Promise.all(arrayOfPromises)
    .then(links => {
        const newLinks = {...links};
        console.log(newLinks)
        links.forEach(url => {
            axios.get(url)
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const countOfPicture = $('.wallpapers__image').length;
                    const numberOfPicture = Math.floor(Math.random() * countOfPicture + 1);
                    url = $($('.wallpapers__item .wallpapers__link')[numberOfPicture]).attr('href');
                })
                .catch(error => {
                console.log(error)
            })
            console.log(links)
            // axios.get(httpGetWallpaper)
        });
    })