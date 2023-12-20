const faker = require('faker');
const slugify= require('slugify');

// Function to generate random company
const generateRandomCompany = () => {
    const companyName = faker.company.companyName();
    const companyDescription= faker.company.bs();

    return {
        code: slugify(companyName, {lower: true}),
        name: companyName,
        description: companyDescription
    };

};

// Function to generate random invoice
function generateRandomInvoice(comp_codes) {
    const comp_code= comp_codes[Math.floor(Math.random() * comp_codes.length)];
    const amt = faker.random.numer({min:50, max:500});
    return {comp_code,amt};
}

// Function to genreate random industry
function generateRandomIndustry() {
    const code = Math.random().toString(36).substring(7);
    const industry = `Industry-${Math.floor(Math.random() * 1000)}`;
    return { code, industry };
}


  module.exports = {
    generateRandomCompany,
    generateRandomInvoice,
    generateRandomIndustry
};