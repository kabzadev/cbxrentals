-- Update all property names from "Property X" to "House X"
UPDATE properties 
SET name = REPLACE(name, 'Property', 'House')
WHERE name LIKE 'Property %';