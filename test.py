# from tools.tavily_tool import tavily_search

# res = tavily_search(" Best hotels in India")

# print(res)
from backend import run_travel_agent


user_input = input("Enter travel request: ")

response = run_travel_agent(
    user_input=user_input,
    thread_id="test_user"
)

print("\nFINAL RESPONSE:\n")
print(response["answer"])