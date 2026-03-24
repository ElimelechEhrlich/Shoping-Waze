from elasticsearch import Elasticsearch

es = Elasticsearch("http://elasticsearch:9200")

def index_items(receipt):
    for item in receipt["items"]:
        es.index(
            index="products",
            document={
                "name": item["name"],
                "price": item["price"],
                "store": receipt["store"]
            }
        )

def find_cheapest(items):
    results = {}

    for item in items:
        res = es.search(
            index="products",
            query={
                "match": {
                    "name": {
                        "query": item,
                        "fuzziness": "AUTO"
                    }
                }
            }
        )

        for hit in res["hits"]["hits"]:
            store = hit["_source"]["store"]
            price = hit["_source"]["price"]

            results.setdefault(store, 0)
            results[store] += price

    return sorted(results.items(), key=lambda x: x[1])

