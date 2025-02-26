from ortools.linear_solver import pywraplp
import json

# Para fertilizar una parcela se utilizan 2 tipos de fertilizantes, uno A y otro B, el cultivo de la parcela necesita un
# minimo de 110kg de fosforo y 100kg de nitrogeno. El fertilizante A contiene un 25% de nitrogeno y un 15% de fosforo siendo
# su precio de 1,20€ el kilo, mientras que el fertilizante B contiene un 16% de nitrogeno y un 40% de fosforo, siendo su
# precio de 1,60€ el kilo.
#
# Que cantidad de fertilizante de cada tipo se necesita para que el coste sea minimo y cual es ese coste mínimo.

def load_data():
   f = open('../output.json', encoding='utf-8')
   data = json.load(f)
   return data

def main():
    solver = pywraplp.Solver.CreateSolver('SCIP')
    if not solver:
        print('No se pudo iniciar el solver')
        return

    data = load_data()
    if not data:
        print('No se pudo iniciar el dato')
        return

    # Definir variables
    # x[i][j] es la cantidad de cartas i compradas al vendedor j
    infinity = solver.infinity()
    x = {}
    for i, card in enumerate(data):
        for j, offer in enumerate(card['offers']):
            print(offer)
            x[i, j] = solver.IntVar(0, offer['quantity'], f'x_{i}_{j}')

    # Variables binarias de envío:
    # y[j] es 1 si se compra algo al vendedor j, 0 si no
    y = {}
    for j in enumerate(M):
        y[j] = solver.IntVar(0.0, 1.0, f'y_{j}')

    print("Numero de variables: ", solver.NumVariables())

    semen = {}

    # Restricción de fosforo 0,15x+0,40y≥110
    fosforo = solver.Constraint(110, infinity, "Restriccion fosforo")
    fosforo.SetCoefficient(semen['x'], 0.15)
    fosforo.SetCoefficient(semen['y'], 0.4)

    # Restricción de nitrogeno 0,25x+0,16y≥100
    nitrogeno = solver.Constraint(100, infinity, "Restriccion nitrogeno")
    nitrogeno.SetCoefficient(semen['x'], 0.25)
    nitrogeno.SetCoefficient(semen['y'], 0.16)

    print("Numero de restricciones: ", solver.NumConstraints())

    # Definir la función objetivo C=1,20x+1,60y
    objective = solver.Objective()
    objective.SetCoefficient(semen['x'], 1.2)
    objective.SetCoefficient(semen['y'], 1.6)
    objective.SetMinimization()

    # Calcular el resultado
    print(f"Resolviendo con {solver.SolverVersion()}")
    result_status = solver.Solve()
    print(f"Status: {result_status}")
    if result_status != pywraplp.Solver.OPTIMAL:
        print("El problema no tiene una solución optima!")
        if result_status == pywraplp.Solver.FEASIBLE:
            print("Hay una potencial solución suboptima ¡")
        else:
            print("El solver no pudo resolver el problema.")
            return

    print("Solución:")
    print(f"Coste = {objective.Value()}€")
    # print(f"x = {semen['x'].solution_value()}kg de fertilizante A")
    # print(f"y = {semen['y'].solution_value()}kg de fertilizante B")

main()