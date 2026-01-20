const cities = [
    // Rank 11-20
    { rank: 11, name: "Libourne", zip: "33500", zone: "Libournais" },
    { rank: 12, name: "Eysines", zip: "33320", zone: "Métropole" },
    { rank: 13, name: "Le Bouscat", zip: "33110", zone: "Métropole" },
    { rank: 14, name: "Lormont", zip: "33310", zone: "Métropole" },
    { rank: 15, name: "Gujan-Mestras", zip: "33470", zone: "Bassin d'Arcachon" },
    { rank: 16, name: "Bruges", zip: "33520", zone: "Métropole" },
    { rank: 17, name: "Floirac", zip: "33270", zone: "Métropole" },
    { rank: 18, name: "Cestas", zip: "33610", zone: "Sud-Gironde" },
    { rank: 19, name: "Ambarès-et-Lagrave", zip: "33440", zone: "Métropole" },
    { rank: 20, name: "Blanquefort", zip: "33290", zone: "Métropole" },

    // Rank 21-30
    { rank: 21, name: "Saint-André-de-Cubzac", zip: "33240", zone: "Libournais" }, // Haute-Gironde limit
    { rank: 22, name: "Andernos-les-Bains", zip: "33510", zone: "Bassin d'Arcachon" },
    { rank: 23, name: "Arcachon", zip: "33120", zone: "Bassin d'Arcachon" },
    { rank: 24, name: "Le Haillan", zip: "33185", zone: "Métropole" },
    { rank: 25, name: "Mios", zip: "33380", zone: "Bassin d'Arcachon" },
    { rank: 26, name: "Biganos", zip: "33380", zone: "Bassin d'Arcachon" },
    { rank: 27, name: "Le Taillan-Médoc", zip: "33320", zone: "Médoc" }, // Metropole but Médoc vibe
    { rank: 28, name: "Léognan", zip: "33850", zone: "Sud-Gironde" },
    { rank: 29, name: "Parempuyre", zip: "33290", zone: "Médoc" }, // Metropole
    { rank: 30, name: "Saint-Loubès", zip: "33450", zone: "Libournais" },

    // Rank 31-40
    { rank: 31, name: "Audenge", zip: "33980", zone: "Bassin d'Arcachon" },
    { rank: 32, name: "Saint-Jean-d'Illac", zip: "33127", zone: "Métropole" }, // Peri-urbain
    { rank: 33, name: "Le Teich", zip: "33470", zone: "Bassin d'Arcachon" },
    { rank: 34, name: "Artigues-près-Bordeaux", zip: "33370", zone: "Métropole" },
    { rank: 35, name: "Coutras", zip: "33230", zone: "Libournais" },
    { rank: 36, name: "Carbon-Blanc", zip: "33560", zone: "Métropole" },
    { rank: 37, name: "Lège-Cap-Ferret", zip: "33950", zone: "Bassin d'Arcachon" },
    { rank: 38, name: "Salles", zip: "33770", zone: "Sud-Gironde" },
    { rank: 39, name: "Martignas-sur-Jalle", zip: "33127", zone: "Métropole" },
    { rank: 40, name: "Langon", zip: "33210", zone: "Sud-Gironde" },

    // Rank 41-50
    { rank: 41, name: "Lanton", zip: "33138", zone: "Bassin d'Arcachon" },
    { rank: 42, name: "Le Pian-Médoc", zip: "33290", zone: "Médoc" },
    { rank: 43, name: "Saint-Aubin-de-Médoc", zip: "33160", zone: "Médoc" },
    { rank: 44, name: "Cadaujac", zip: "33140", zone: "Sud-Gironde" },
    { rank: 45, name: "Izon", zip: "33450", zone: "Libournais" },
    { rank: 46, name: "Bassens", zip: "33530", zone: "Métropole" },
    { rank: 47, name: "Canéjan", zip: "33610", zone: "Sud-Gironde" },
    { rank: 48, name: "Saint-Denis-de-Pile", zip: "33910", zone: "Libournais" },
    { rank: 49, name: "Le Barp", zip: "33114", zone: "Sud-Gironde" },
    { rank: 50, name: "Marcheprime", zip: "33380", zone: "Bassin d'Arcachon" },

    // Rank 51-60
    { rank: 51, name: "Lacanau", zip: "33680", zone: "Médoc" },
    { rank: 52, name: "Arès", zip: "33740", zone: "Bassin d'Arcachon" },
    { rank: 53, name: "La Brède", zip: "33650", zone: "Sud-Gironde" },
    { rank: 54, name: "Sadirac", zip: "33670", zone: "Entre-deux-Mers" },
    { rank: 55, name: "Blaye", zip: "33390", zone: "Haute-Gironde" },
    { rank: 56, name: "Pauillac", zip: "33250", zone: "Médoc" },
    { rank: 57, name: "Tresses", zip: "33370", zone: "Entre-deux-Mers" },
    { rank: 58, name: "Castelnau-de-Médoc", zip: "33480", zone: "Médoc" },
    { rank: 59, name: "Vayres", zip: "33870", zone: "Libournais" },
    { rank: 60, name: "Saint-Seurin-sur-l'Isle", zip: "33660", zone: "Libournais" },

    // Rank 61-70
    { rank: 61, name: "Saint-Caprais-de-Bordeaux", zip: "33880", zone: "Entre-deux-Mers" },
    { rank: 62, name: "Latresne", zip: "33360", zone: "Entre-deux-Mers" },
    { rank: 63, name: "Belin-Béliet", zip: "33830", zone: "Sud-Gironde" },
    { rank: 64, name: "Macau", zip: "33460", zone: "Médoc" },
    { rank: 65, name: "Sainte-Eulalie", zip: "33560", zone: "Libournais" },
    { rank: 66, name: "Ludon-Médoc", zip: "33290", zone: "Médoc" },
    { rank: 67, name: "Saint-Savin", zip: "33920", zone: "Haute-Gironde" },
    { rank: 68, name: "Créon", zip: "33670", zone: "Entre-deux-Mers" },
    { rank: 69, name: "Montussan", zip: "33450", zone: "Libournais" }, // Entre-deux-mers limit
    { rank: 70, name: "Hourtin", zip: "33990", zone: "Médoc" },

    // Rank 71-80
    { rank: 71, name: "Bazas", zip: "33430", zone: "Sud-Gironde" },
    { rank: 72, name: "Saint-Sulpice-et-Cameyrac", zip: "33450", zone: "Libournais" },
    { rank: 73, name: "Bouliac", zip: "33270", zone: "Métropole" },
    { rank: 74, name: "Cadillac", zip: "33410", zone: "Entre-deux-Mers" }, // Or Sud-Gironde
    { rank: 75, name: "Podensac", zip: "33720", zone: "Sud-Gironde" },
    { rank: 76, name: "Saint-Ciers-sur-Gironde", zip: "33820", zone: "Haute-Gironde" },
    { rank: 77, name: "Cézac", zip: "33620", zone: "Haute-Gironde" },
    { rank: 78, name: "Saint-Laurent-Médoc", zip: "33112", zone: "Médoc" },
    { rank: 79, name: "Pineuilh", zip: "33220", zone: "Libournais" }, // Ste Foy
    { rank: 80, name: "Castillon-la-Bataille", zip: "33350", zone: "Libournais" },

    // Rank 81-90
    { rank: 81, name: "Arsac", zip: "33460", zone: "Médoc" },
    { rank: 82, name: "Avensan", zip: "33480", zone: "Médoc" },
    { rank: 83, name: "Carignan-de-Bordeaux", zip: "33360", zone: "Entre-deux-Mers" },
    { rank: 84, name: "Sainte-Hélène", zip: "33480", zone: "Médoc" },
    { rank: 85, name: "Galgon", zip: "33133", zone: "Libournais" },
    { rank: 86, name: "Marsas", zip: "33620", zone: "Haute-Gironde" },
    { rank: 87, name: "La Réole", zip: "33190", zone: "Sud-Gironde" },
    { rank: 88, name: "Saint-Magne-de-Castillon", zip: "33350", zone: "Libournais" },
    { rank: 89, name: "Saint-Emilion", zip: "33330", zone: "Libournais" },
    { rank: 90, name: "Ambès", zip: "33810", zone: "Métropole" },

    // Rank 91-100
    { rank: 91, name: "Soulac-sur-Mer", zip: "33780", zone: "Médoc" },
    { rank: 92, name: "Vendays-Montalivet", zip: "33930", zone: "Médoc" },
    { rank: 93, name: "Bourg", zip: "33710", zone: "Haute-Gironde" },
    { rank: 94, name: "Monségur", zip: "33580", zone: "Sud-Gironde" }, // Entre-deux-mers limit
    { rank: 95, name: "Sainte-Foy-la-Grande", zip: "33220", zone: "Libournais" },
    { rank: 96, name: "Targon", zip: "33760", zone: "Entre-deux-Mers" },
    { rank: 97, name: "Sauveterre-de-Guyenne", zip: "33540", zone: "Entre-deux-Mers" },
    { rank: 98, name: "Castres-Gironde", zip: "33640", zone: "Sud-Gironde" },
    { rank: 99, name: "Fargues-Saint-Hilaire", zip: "33370", zone: "Entre-deux-Mers" },
    { rank: 100, name: "Yvrac", zip: "33370", zone: "Entre-deux-Mers" }
];

module.exports = cities;
