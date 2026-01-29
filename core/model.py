import pandas as pd
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Input,
    Dense,
    Dropout,
    BatchNormalization,
    Concatenate,
    Embedding,
    GlobalAveragePooling1D,
    TextVectorization,
    Normalization
)


# Read csv file with pandas
df_csv = pd.read_csv("core/syntheticEngData.csv")

# Split into X features based on column name 
X_features = df_csv[
    ["MovingParts", "ForceTorque", "WeightConstraints", 
     "ElectronicsComplexity", "PowerConsumption", "SoftwareComplexity", 
     "MaterialDifficulty", "ChemicalFluids", "StructuralLoad", 
     "Aerodynamics", "EnvironmentalConstraints"]
]

# Split into first Y label and encode 
primary_field = df_csv["PrimaryField"]
primary_onehot = pd.get_dummies(primary_field)

# Split into second Y labels
contributions = df_csv[
    ["Mechanical_Pct", "Electrical_Pct", "Civil_Pct",
     "Chemical_Pct", "Computer_Pct", "Software_Pct",
     "Aerospace_Pct", "Materials_Pct",
     "Environmental_Pct", "Industrial_Pct"]
]

# Split into third and final Y label
complexity = df_csv["ProjectComplexity"]

# Split into train and test data with train_test_split() 
X_train, X_test, y_class_train, y_class_test, \
y_pct_train, y_pct_test, y_comp_train, y_comp_test = train_test_split(
    X_features,
    primary_onehot,
    contributions,
    complexity,
    test_size=0.2,
    random_state=42
)

# Create numeric data varible for future use
numeric_data = np.array(X_train[["MovingParts", "ForceTorque", "WeightConstraints", 
     "ElectronicsComplexity", "PowerConsumption", "SoftwareComplexity", 
     "MaterialDifficulty", "ChemicalFluids", "StructuralLoad", 
     "Aerodynamics", "EnvironmentalConstraints"]])

# Define inputs 
input_numeric = Input(shape=(11,), dtype=tf.float32, name='numeric_input') 

# Create normalizer to standardize numeric features to a mean of 0 and a standard deviation of 1 and then adapt numeric data to it 
normalizer = Normalization() 
normalizer.adapt(numeric_data) 

# Create normalization layer and pass input layer to it 
x = normalizer(input_numeric) 

# Add batch normalization layer in order to stabilize and speed up training 
x = BatchNormalization()(x) 

# Add dense layer with relu activation
x = Dense(64, activation="relu")(x) 

# Add dropout layer to reduce overfitting 
x = Dropout(0.3)(x) 

# Add second dense layer with relu activation
x = Dense(32, activation="relu")(x) 

# Create output layers and pass in previous layers
primary_out = Dense(10, activation="softmax", name="primary_field")(x)
contrib_out = Dense(10, activation="linear", name="contributions")(x)
complexity_out = Dense(1, activation="linear", name="complexity")(x)

# Define model with previous inputs and finalized output 
model = Model(inputs=input_numeric, outputs=[primary_out, contrib_out, complexity_out]) 

# Compile model with proper metrics and adam optimizer 
model.compile(
    optimizer="adam",
    loss={
        "primary_field": "categorical_crossentropy",
        "contributions": "mse",
        "complexity": "mse"
    },
    metrics={
        "primary_field": "accuracy",
        "contributions": "accuracy",
        "complexity": "accuracy"
    },
    loss_weights={
        "primary_field": 1.0,
        "contributions": 0.5,
        "complexity": 0.5
    }
)

# Train the model using the fit() method while passing in the training inputs and labels and storing the history in a variable for later analysis 
history = model.fit(
    numeric_data,
    {
        "primary_field": y_class_train,
        "contributions": y_pct_train,
        "complexity": y_comp_train
    },
    epochs=100,
    batch_size=32,
    validation_split=0.2
)


# Use stored history variable and matplotlib to visualize loss and metric performance during training 
plt.plot(history.history["loss"], label="Train Loss") 
plt.plot(history.history["val_loss"], label="Val Loss") 
plt.legend() 
plt.show() 
plt.plot(history.history["mae"], label="Train MAE") 
plt.plot(history.history["val_mae"], label="Val MAE") 
plt.legend() 
plt.show() 

# Save model to chosen path for later use (shown here) 
# model.save("core/engineering_model") 

# loaded_model = tf.keras.models.load_model("core/engieering_model") 