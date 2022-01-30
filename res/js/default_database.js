DEFAULT_DATABASE = {
    "items": {
        "sand_flux": {
            "tags": [
                "t1",
                "flux"
            ]
        },
        "shelldust_flux": {
            "tags": [
                "t2",
                "flux"
            ]
        },
        "obsidian_flux": {
            "tags": [
                "t3",
                "flux"
            ]
        },
        "coarse_sandpaper": {
            "tags": [
                "t1",
                "sandpaper"
            ]
        },
        "fine_sandpaper": {
            "tags": [
                "t2",
                "sandpaper"
            ]
        },
        "obsidian_sandpaper": {
            "tags": [
                "t3",
                "sandpaper"
            ]
        },
        "weak_solvent": {
            "tags": [
                "t1",
                "solvent"
            ]
        },
        "pure_solvent": {
            "tags": [
                "t2",
                "solvent"
            ]
        },
        "potent_solvent": {
            "tags": [
                "t3",
                "solvent"
            ]
        },
        "tannin": {
            "tags": [
                "t1",
                "tannin"
            ]
        },
        "rested_tannin": {
            "tags": [
                "t2",
                "tannin"
            ]
        },
        "aged_tannin": {
            "tags": [
                "t3",
                "tannin"
            ]
        },
        "crossweave": {
            "tags": [
                "t1",
                "weave"
            ]
        },
        "silkweave": {
            "tags": [
                "t2",
                "weave"
            ]
        },
        "wireweave": {
            "tags": [
                "t3",
                "weave"
            ]
        },
        "rawhide": {
            "tags": [
                "t1",
                "hide"
            ]
        },
        "thick_hide": {
            "tags": [
                "t2",
                "hide"
            ]
        },
        "iron_hide": {
            "tags": [
                "t3",
                "hide"
            ]
        },
        "corrupted_sliver": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t1",
                "corruption"
            ]
        },
        "corrupted_fragment": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t2",
                "corruption"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "corruption"],
                    "count": 5
                }
            ],
        },
        "corrupted_shard": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t3",
                "corruption"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "corruption"],
                    "count": 4
                }
            ],
        },
        "corrupted_crystal": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t4",
                "corruption"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "corruption"],
                    "count": 3
                }
            ],
        },
        "corrupted_lodestone": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t5",
                "corruption"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "corruption"],
                    "count": 2
                }
            ],
        },
        "coarse_leather": {
            "skill": "leatherworking",
            "baseMultiplier": 0.2,
            "tags": [
                "t1",
                "leather"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "hide"],
                    "count": 4
                }
            ],
            "xp": 36
        },
        "rugged_leather": {
            "skill": "leatherworking",
            "baseMultiplier": 0.18,
            "tags": [
                "t2",
                "leather"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "leather"],
                    "count": 4
                }
            ],
            "refiner": {
                "tag": "tannin",
                "multipliers": [
                    0.5,
                    0.75
                ]
            },
            "xp": 190
        },
        "layered_leather": {
            "skill": "leatherworking",
            "baseMultiplier": 0.1,
            "tags": [
                "t3",
                "leather"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "leather"],
                    "count": 2
                },
                {
                    "tags": ["t2", "hide"],
                    "count": 6
                }
            ],
            "refiner": {
                "tag": ["tannin"],
                "multipliers": [
                    0.05,
                    0.3
                ]
            },
            "xp": 1665
        },
        "infused_leather": {
            "skill": "leatherworking",
            "baseMultiplier": 0.03,
            "tags": [
                "t4",
                "leather"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "leather"],
                    "count": 2
                },
                {
                    "tags": ["t3", "hide"],
                    "count": 8
                }
            ],
            "refiner": {
                "tag": "tannin",
                "multipliers": [
                    0.05,
                    0.1
                ]
            },
            "xp": 8470
        },
        "stone": {
            "tags": [
                "t1",
                "stone"
            ]
        },
        "lodestone": {
            "tags": [
                "t2",
                "stone"
            ]
        },
        "loamy_lodestone": {
            "tags": [
                "t1",
                "elemental_lodestone"
            ]
        },
        "iron_ore": {
            "tags": [
                "t1",
                "ore",
                "metal_ore"
            ]
        },
        "starmetal_ore": {
            "tags": [
                "t2",
                "ore",
                "metal_ore"
            ]
        },
        "orichalcum_ore": {
            "tags": [
                "t3",
                "ore",
                "metal_ore"
            ]
        },
        "silver_ore": {
            "tags": [
                "t1",
                "ore",
                "precious_ore"
            ]
        },
        "gold_ore": {
            "tags": [
                "t2",
                "ore",
                "precious_ore"
            ]
        },
        "platinum_ore": {
            "tags": [
                "t3",
                "ore",
                "precious_ore"
            ]
        },
        "charcoal": {
            "skill": "smelting",
            "baseMultiplier": 0.2,
            "tags": [
                "charcoal"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "wood"],
                    "count": 2
                }
            ],
            "xp": 18
        },
        "fibers": {
            "tags": [
                "t1",
                "fiber"
            ]
        },
        "silk_threads": {
            "tags": [
                "t2",
                "fiber"
            ]
        },
        "wirefiber": {
            "tags": [
                "t3",
                "fiber"
            ]
        },
        "linen": {
            "skill": "weaving",
            "baseMultiplier": 0.2,
            "tags": [
                "t1",
                "cloth",
                "refined_cloth"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "fiber"],
                    "count": 4
                }
            ],
            "xp": 36
        },
        "sateen": {
            "skill": "weaving",
            "baseMultiplier": 0.18,
            "tags": [
                "t2",
                "cloth",
                "refined_cloth"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "refined_cloth"],
                    "count": 4
                }
            ],
            "refiner": {
                "tag": "weave",
                "multipliers": [
                    0.5,
                    0.75
                ]
            },
            "xp": 190
        },
        "silk": {
            "skill": "weaving",
            "baseMultiplier": 0.10,
            "tags": [
                "t3",
                "cloth",
                "refined_cloth"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "refined_cloth"],
                    "count": 2
                },
                {
                    "tags": ["t2", "fiber"],
                    "count": 6
                }
            ],
            "refiner": {
                "tag": "weave",
                "multipliers": [
                    0.1,
                    0.30
                ]
            },
            "xp": 1665
        },
        "infused_silk": {
            "skill": "weaving",
            "baseMultiplier": 0.03,
            "tags": [
                "t4",
                "cloth",
                "refined_cloth"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "refined_cloth"],
                    "count": 2
                },
                {
                    "tags": ["t3", "fiber"],
                    "count": 8
                }
            ],
            "refiner": {
                "tag": "weave",
                "multipliers": [
                    0.05,
                    0.1
                ]
            },
            "xp": 8470
        },
        "iron_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.2,
            "tags": [
                "t1",
                "ingot",
                "metal_ingot",
                "refined_metal_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "metal_ore"],
                    "count": 4
                }
            ],
            "xp": 36
        },
        "steel_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.18,
            "tags": [
                "t2",
                "ingot",
                "metal_ingot",
                "refined_metal_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "refined_metal_ingot"],
                    "count": 3
                },
                {
                    "tags": ["charcoal"],
                    "count": 2
                }
            ],
            "refiner": {
                "tag": "flux",
                "multipliers": [
                    0.5,
                    0.75
                ]
            },
            "xp": 228
        },
        "starmetal_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.1,
            "tags": [
                "t3",
                "ingot",
                "metal_ingot",
                "refined_metal_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "metal_ingot"],
                    "count": 2
                },
                {
                    "tags": ["t2", "metal_ore"],
                    "count": 6
                },
                {
                    "tags": ["charcoal"],
                    "count": 2
                }
            ],
            "refiner": {
                "tag": "flux",
                "multipliers": [
                    0.05,
                    0.3
                ]
            },
            "xp": 2035
        },
        "orichalcum_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.03,
            "tags": [
                "t4",
                "ingot",
                "metal_ingot",
                "precious_ingot",
                "refined_metal_ingot",
                "refined_precious_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "metal_ingot"],
                    "count": 2
                },
                {
                    "tags": ["t3", "metal_ore"],
                    "count": 8
                },
                {
                    "tags": ["charcoal"],
                    "count": 2
                }
            ],
            "refiner": {
                "tag": "flux",
                "multipliers": [
                    0.05,
                    0.1
                ]
            },
            "xp": 10010
        },
        "asmodeum_ingot": {
            "skill": "smelting",
            "tags": [
                "t6",
                "ingot",
                "metal_ingot",
                "precious_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "metal_ingot"],
                    "count": 5
                },
                {
                    "tags": ["t5", "metal_ingot"],
                    "count": 2
                },
                {
                    "tags": ["t3", "flux"],
                    "count": 2
                },
                {
                    "tags": ["charcoal"],
                    "count": 2
                }
            ],
            "xp": 7700
        },
        "cinnabar": {
            "tags": [
                "t5",
                "metal_ingot"
            ]
        },
        "tolvium": {
            "tags": [
                "t5",
                "metal_ingot"
            ]
        },
        "scarhide": {
            "tags": [
                "t5",
                "leather"
            ]
        },
        "smolderhide": {
            "tags": [
                "t5",
                "leather"
            ]
        },
        "blisterweave": {
            "tags": [
                "t5",
                "cloth"
            ]
        },
        "scalecloth": {
            "tags": [
                "t5",
                "cloth"
            ]
        },
        "wildwood": {
            "tags": [
                "t5",
                "refined_wood"
            ]
        },
        "barbvine": {
            "tags": [
                "t5",
                "refined_wood"
            ]
        },
        "silver_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.2,
            "tags": [
                "t1",
                "ingot",
                "precious_ingot",
                "refined_precious_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "precious_ore"],
                    "count": 4
                }
            ]
        },
        "gold_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.12,
            "tags": [
                "t2",
                "ingot",
                "precious_ingot",
                "refined_precious_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "refined_precious_ingot"],
                    "count": 2
                },
                {
                    "tags": ["t2", "precious_ore"],
                    "count": 5
                }
            ],
            "refiner": {
                "tag": "flux",
                "multipliers": [
                    0.2,
                    0.4
                ]
            }
        },
        "platinum_ingot": {
            "skill": "smelting",
            "baseMultiplier": 0.08,
            "tags": [
                "t3",
                "ingot",
                "precious_ingot",
                "refined_precious_ingot"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "refined_precious_ingot"],
                    "count": 2
                },
                {
                    "tags": ["t3", "precious_ore"],
                    "count": 6
                }
            ],
            "refiner": {
                "tag": "flux",
                "multipliers": [
                    0.14,
                    0.25
                ]
            }
        },
        "mote": {
            "tags": [
                "t1",
                "mote"
            ]
        },
        "wisp": {
            "skill": "arcana",
            "baseMultiplier": 0.2,
            "tags": [
                "t2",
                "mote"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "mote"],
                    "count": 5
                }
            ],
            "xp": 15
        },
        "essence": {
            "skill": "arcana",
            "baseMultiplier": 0.2,
            "tags": [
                "t3",
                "mote"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "mote"],
                    "count": 4
                }
            ],
            "xp": 48
        },
        "quintessence": {
            "skill": "arcana",
            "baseMultiplier": 0.2,
            "tags": [
                "t4",
                "mote"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "mote"],
                    "count": 3
                }
            ],
            "xp": 126
        },
        "green_wood": {
            "tags": [
                "t1",
                "wood"
            ]
        },
        "aged_wood": {
            "tags": [
                "t2",
                "wood"
            ]
        },
        "wyrdwood": {
            "tags": [
                "t3",
                "wood"
            ]
        },
        "ironwood": {
            "tags": [
                "t4",
                "wood"
            ]
        },
        "timber": {
            "skill": "woodworking",
            "baseMultiplier": 0.20,
            "tags": [
                "t1",
                "refined_wood"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "wood"],
                    "count": 4
                }
            ],
            "xp": 36
        },
        "lumber": {
            "skill": "woodworking",
            "baseMultiplier": 0.18,
            "tags": [
                "t2",
                "refined_wood"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "refined_wood"],
                    "count": 2
                },
                {
                    "tags": ["t2", "wood"],
                    "count": 4
                }
            ],
            "refiner": {
                "tag": "sandpaper",
                "multipliers": [
                    0.5,
                    0.75
                ]
            },
            "xp": 266
        },
        "wyrdwood_planks": {
            "skill": "woodworking",
            "baseMultiplier": 0.10,
            "tags": [
                "t3",
                "refined_wood"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "refined_wood"],
                    "count": 2
                },
                {
                    "tags": ["t3", "wood"],
                    "count": 6
                }
            ],
            "refiner": {
                "tag": "sandpaper",
                "multipliers": [
                    0.05,
                    0.25
                ]
            },
            "xp": 1665
        },
        "ironwood_planks": {
            "skill": "woodworking",
            "baseMultiplier": 0.03,
            "tags": [
                "t4",
                "refined_wood"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "refined_wood"],
                    "count": 2
                },
                {
                    "tags": ["t4", "wood"],
                    "count": 8
                }
            ],
            "refiner": {
                "tag": "sandpaper",
                "multipliers": [
                    0.05,
                    0.1
                ]
            },
            "xp": 8470
        },
        "gem_brilliant": {
            "tags": [
                "t3",
                "gem",
                "gem_expensive"
            ]
		},
        "brilliant_gem": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t3",
                "gem",
                "gem_cheap"
            ]
		},
        "pristine_gem": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t4",
                "gem",
                "gem_cheap"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "gem_cheap"],
                    "count": 5
                },
                {
                    "tags": ["t4", "mote"],
                    "count": 1
                }
            ]
		},
        "pristine_gem_cut": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t4",
                "gem",
                "gem_cheap"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "gem_cheap"],
                    "count": 1
                },
                {
                    "tags": ["t4", "mote"],
                    "count": 3
                }
            ]
		},
        "brilliant_onyx": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t3",
                "gem",
                "gem_expensive"
            ]
		},
        "pristine_onyx": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t4",
                "gem",
                "gem_expensive"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "gem_expensive"],
                    "count": 5
                },
                {
                    "tags": ["t4", "mote"],
                    "count": 1
                }
            ]
		},
        "pristine_onyx_cut": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t4",
                "gem_cut",
                "gem_expensive_cut"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "gem_expensive"],
                    "count": 1
                },
                {
                    "tags": ["t4", "mote"],
                    "count": 3
                }
            ]
		},
        "stone_block": {
            "skill": "stonecutting",
            "baseMultiplier": 0.2,
            "tags": [
                "t1",
                "refined_stone"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "stone"],
                    "count": 4
                }
            ],
            "xp": 36
        },
        "stone_brick": {
            "skill": "stonecutting",
            "baseMultiplier": 0.18,
            "tags": [
                "t2",
                "refined_stone"
            ],
            "ingredients": [
                {
                    "tags": ["t1", "refined_stone"],
                    "count": 4
                }
            ],
            "refiner": {
                "tag": "sandpaper",
                "multipliers": [
                    0.5,
                    0.75
                ]
            },
            "xp": 180
        },
        "lodestone_brick": {
            "skill": "stonecutting",
            "baseMultiplier": 0.1,
            "tags": [
                "t3",
                "refined_stone"
            ],
            "ingredients": [
                {
                    "tags": ["t2", "refined_stone"],
                    "count": 2
                },
                {
                    "tags": ["t2", "stone"],
                    "count": 6
                }
            ],
            "refiner": {
                "tag": "sandpaper",
                "multipliers": [
                    0.05,
                    0.3
                ]
            },
            "xp": 1539
        },
        "obsidian_voidstone": {
            "skill": "stonecutting",
            "baseMultiplier": 0.03,
            "tags": [
                "t4",
                "refined_stone"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "refined_stone"],
                    "count": 8
                },
                {
                    "tags": ["t2", "stone"],
                    "count": 2
                },
                {
                    "tags": ["t1", "elemental_lodestone"],
                    "count": 1
                }
            ],
            "refiner": {
                "tag": "sandpaper",
                "multipliers": [
                    0.05,
                    0.3
                ]
            },
            "xp": 9240
        },
        "honing_stone_strong": {
            "skill": "weaponsmithing",
            "tags": [
                "t3",
                "honing_stone"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "mote"],
                    "count": 2
                },
                {
                    "tags": ["t3", "refined_stone"],
                    "count": 1
                }
            ],
            "xp": 504
        },
        "honing_stone_powerful": {
            "skill": "weaponsmithing",
            "tags": [
                "t4",
                "honing_stone"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "mote"],
                    "count": 2
                },
                {
                    "tags": ["t4", "refined_stone"],
                    "count": 1
                }
            ],
            "xp": 1512
        },
        "bow_wyrdwood": {
            "skill": "engineering",
            "tags": [
                "t3",
                "bow"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "refined_wood"],
                    "count": 14
                },
                {
                    "tags": ["t1", "leather"],
                    "count": 3
                },
                {
                    "tags": ["t1", "cloth"],
                    "count": 2
                }
            ],
            "xp": 3192
        },
        "bow_ironwood": {
            "skill": "engineering",
            "tags": [
                "t4",
                "bow"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "refined_wood"],
                    "count": 15
                },
                {
                    "tags": ["t1", "leather"],
                    "count": 3
                },
                {
                    "tags": ["t1", "cloth"],
                    "count": 2
                }
            ],
            "xp": 10080
        },
        "spear_wyrdwood": {
            "skill": "engineering",
            "tags": [
                "t3",
                "bow"
            ],
            "ingredients": [
                {
                    "tags": ["t3", "refined_wood"],
                    "count": 12
                },
                {
                    "tags": ["t1", "metal_ingot"],
                    "count": 5
                },
                {
                    "tags": ["t1", "leather"],
                    "count": 2
                }
            ],
            "xp": 3192
        },
        "spear_ironwood": {
            "skill": "engineering",
            "tags": [
                "t4",
                "bow"
            ],
            "ingredients": [
                {
                    "tags": ["t4", "refined_wood"],
                    "count": 13
                },
                {
                    "tags": ["t1", "metal_ingot"],
                    "count": 5
                },
                {
                    "tags": ["t1", "leather"],
                    "count": 2
                }
            ],
            "xp": 10080
        },
        "gunpowder": {
            "skill": "engineering",
            "tags": [
                "gunpowder"
            ],
            "ingredients": [
                {
                    "tags": ["charcoal"],
                    "count": 5
                },
                {
                    "tags": ["flint"],
                    "count": 2
                },
                {
                    "tags": ["saltpeter"],
                    "count": 1
                }
            ],
            "xp": 96
        },
        "cooking_oil": {
            "skill": "cooking",
            "baseMultiplier": 0.20,
			"tags": [
                "cooking_oil"
            ],
            "ingredients": [
                {
                    "tags": ["nut"],
                    "count": 1
                },
                {
                    "tags": ["fish_oil"],
                    "count": 2
                }
            ],
			"xp": 9
		},
        "nut": {
		},
        "fish_oil": {
		},
        "butter": {
            "skill": "cooking",
            "baseMultiplier": 0.20,
			"tags": [
                "butter"
            ],
            "ingredients": [
                {
                    "tags": ["milk"],
                    "count": 2
                }
            ],
			"xp": 6
		},
        "meal_pork_belly_fried_rice": {
            "skill": "cooking",
            "baseMultiplier": 0.13,
			"tags": [
				"t5",
                "meal"
            ],
            "ingredients": [
                {
                    "tags": ["pork_belly"],
                    "count": 1
                },
                {
                    "tags": ["rice"],
                    "count": 1
                },
                {
                    "tags": ["cooking_oil"],
                    "count": 1
                },
                {
                    "tags": ["egg"],
                    "count": 1
                },
                {
                    "tags": ["onion"],
                    "count": 1
                },
                {
                    "tags": ["garlic"],
                    "count": 1
                },
                {
                    "tags": ["salt"],
                    "count": 1
                }
            ],
			"xp": 945
		},
        "meal_roasted_rabbit": {
            "skill": "cooking",
            "baseMultiplier": 0.13,
			"tags": [
				"t5",
                "meal"
            ],
            "ingredients": [
                {
                    "tags": ["sumptuous_rabbit"],
                    "count": 1
                },
                {
                    "tags": ["butter"],
                    "count": 1
                },
                {
                    "tags": ["broccoli"],
                    "count": 1
                },
                {
                    "tags": ["cauliflower"],
                    "count": 1
                },
                {
                    "tags": ["squash"],
                    "count": 1
                },
                {
                    "tags": ["tarragon"],
                    "count": 1
                },
                {
                    "tags": ["oregano"],
                    "count": 1
                }
            ],
			"xp": 945
		},
        "pork_belly": {
			"tags": [
				"t5",
                "pork_belly",
				"food"
            ]
		},
        "rice": {
			"tags": [
				"t5",
                "rice",
				"food"
            ]
		},
        "egg": {
			"tags": [
				"t1",
                "egg",
				"food"
            ]
		},
        "sumptuous_rabbit": {
			"tags": [
				"t5",
                "sumptuous_rabbit",
				"food"
            ]
		},
        "onion": {
			"tags": [
				"t3",
                "onion",
				"food"
            ]
		},
        "garlic": {
			"tags": [
				"t1",
                "garlic",
				"food"
            ]
		},
        "broccoli": {
			"tags": [
				"t4",
                "broccoli",
				"food"
            ]
		},
        "cauliflower": {
			"tags": [
				"t4",
                "cauliflower",
				"food"
            ]
		},
        "squash": {
			"tags": [
				"t2",
                "squash",
				"food"
            ]
		},
        "milk": {
			"tags": [
				"t1",
                "milk",
				"food"
            ]
		},
        "salt": {
			"tags": [
				"t1",
                "salt",
				"seasoning"
            ]
		},
        "cinnamon": {
			"tags": [
				"t1",
                "cinnamon",
				"seasoning"
            ]
		},
        "tarragon": {
			"tags": [
				"t1",
                "tarragon",
				"seasoning"
            ]
		},
        "oregano": {
			"tags": [
				"t1",
                "oregano",
				"seasoning"
            ]
		},
        "hyssop": {},
        "flint": {
			"tags": [
                "flint"
            ]
		},
        "saltpeter": {
			"tags": [
                "saltpeter"
            ]
		},
        "salamander_slime": {},
        "blightroot_stem": {},
        "rivercress_stem": {},
        "vial_of_suspended_azoth": {}
    },
    "prices": {
        "sand_flux": 5,
        "shelldust_flux": 5,
        "obsidian_flux": 1.7,
        "coarse_sandpaper": 5,
        "fine_sandpaper": 5,
        "obsidian_sandpaper": 1.1,
        "weak_solvent": 0.01,
        "pure_solvent": 0.01,
        "potent_solvent": 0.2,
        "tannin": 5,
        "rested_tannin": 5,
        "aged_tannin": 0.2,
        "crossweave": 5,
        "silkweave": 5,
        "wireweave": 0.2,
        "rawhide": 0.25,
        "thick_hide": 0.5,
        "iron_hide": 0.07,
        "stone": 0.12,
        "lodestone": 0.6,
        "elemental_lodestone": 1,
        "iron_ore": 0.3,
        "starmetal_ore": 0.7,
        "orichalcum_ore": 1.8,
        "silver_ore": 0.35,
        "gold_ore": 0.3,
        "platinum_ore": 0.4,
        "charcoal": 0.3,
        "fibers": 0.15,
        "silk_threads": 0.4,
        "wirefiber": 0.2,
        "asmodeum_ingot": 350,
        "mote": 0.5,
        "green_wood": 0.15,
        "aged_wood": 0.15,
        "wyrdwood": 0.5,
        "ironwood": 0.5,
        "gem_brilliant": 4,
        "gem_pristine_expensive": 300,
        "egg": 11,
        "onion": 2.3,
        "garlic": 4.4,
        "rice": 0.5,
        "pork_belly": 0.5,
        "cooking_oil": 0.5,
        "salt": 10,
        "cinnamon": 1,
        "hyssop": 0.01,
        "flint": 0.3,
        "saltpeter": 0.2,
        "salamander_slime": 3,
        "blightroot_stem": 0.03,
        "rivercress_stem": 0.35,
        "asmodeum": 390,
        "tolvium": 13,
        "cinnabar": 13,
        "blisterweave": 8,
        "scalecloth": 8,
        "smolderhide": 12,
        "scarhide": 12,
        "barbvine": 9,
        "wildwood": 9,
        "vial_of_suspended_azoth": 30
    },
    "skills": {
        "cooking": {
            "aptitude_chest_xp": 2435000,
            "multiplier": 0.00,
            "chests": {
            }
        },
        "smelting": {
            "aptitude_chest_xp": 2435000,
            "multiplier": 0.00,
            "chests": {
                "t1": {
                    "guaranteed": {
                        "cinnabar": 3,
                        "tolvium": 3,
                        "obsidian_flux": 40,
                        "vial_of_suspended_azoth": 3
                    },
                    "chance": {
                    }
                }
            }
        },
        "weaving": {
            "aptitude_chest_xp": 2435000,
            "multiplier": 0.10,
            "chests": {
                "t1": {
                    "guaranteed": {
                        "scalecloth": 3,
                        "blisterweave": 3,
                        "wireweave": 40,
                        "vial_of_suspended_azoth": 3
                    },
                    "chance": {
                    }
                }
            }
        },
        "leatherworking": {
            "aptitude_chest_xp": 2435000,
            "multiplier": 0.10,
            "chests": {
                "t1": {
                    "guaranteed": {
                        "smolderhide": 3,
                        "scarhide": 3,
                        "aged_tannin": 40,
                        "vial_of_suspended_azoth": 3
                    },
                    "chance": {
                    }
                }
            }
        },
        "stonecutting": {
            "aptitude_chest_xp": 2435000,
            "multiplier": 0.10,
            "chests": {
                "t1": {
                    "guaranteed": {
                        "potent_solvent": 40,
                        "vial_of_suspended_azoth": 3
                    },
                    "chance": {
                    }
                }
            }
        },
        "woodworking": {
            "aptitude_chest_xp": 2435000,
            "multiplier": 0.08,
            "chests": {
                "t1": {
                    "guaranteed": {
                        "wildwood": 3,
                        "barbvine": 3,
                        "obsidian_sandpaper": 40,
                        "vial_of_suspended_azoth": 3
                    },
                    "chance": {
                    }
                }
            }
        }
    },
}