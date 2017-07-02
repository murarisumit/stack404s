Vue.component('greeter', {

    template: `
        <div>
            Hello, {{ name }}!
        </div>`,

    props: ['name'],
});