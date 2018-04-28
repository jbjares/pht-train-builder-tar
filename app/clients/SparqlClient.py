import urllib
import requests



def query():

    return urllib.parse.quote("""
         PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
         PREFIX sct: <http://purl.bioontology.org/ontology/SNOMEDCT/>
         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
         PREFIX xml: <http://www.w3.org/XML/1998/namespace>

         SELECT distinct ?Name, ?Comment, ?DataType FROM <http://localhost:8890/CleavelandCommented>
                WHERE {?class skos:prefLabel ?Name;
                              skos:altLabel ?Comment;
                              rdfs:range ?range.
                        bind(strafter(str(?range),str(xsd:)) as ?DataType ) .
                        VALUES ?DataType {'string' 'decimal'}.}""")


def search_url():
    return 'http://165.227.154.124:8890/sparql?query={}&format=json'.format(query())


class SparqlClient:

    def __init__(self):
        pass

    @staticmethod
    def query():
        return requests.get(search_url()).json()

