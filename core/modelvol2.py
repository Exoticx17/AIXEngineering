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

# Adding text fields into csv and increasing csv data to 10,000

# Read csv file with pandas
df_csv = pd.read_csv("core/syntheticEngDataVol2.csv")

# Split into X features based on column name 
X_features = df_csv[
    ["MovingParts", "ForceTorque", "WeightConstraints", 
     "ElectronicsComplexity", "PowerConsumption", "SoftwareComplexity", 
     "MaterialDifficulty", "ChemicalFluids", "StructuralLoad", 
     "Aerodynamics", "EnvironmentalConstraints", "ProjectName",
     "PrimaryTechnology", "ProjectDescription"]
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


# Create numeric data variable for future use
numeric_data = np.array(X_train[["MovingParts", "ForceTorque", "WeightConstraints", 
     "ElectronicsComplexity", "PowerConsumption", "SoftwareComplexity", 
     "MaterialDifficulty", "ChemicalFluids", "StructuralLoad", 
     "Aerodynamics", "EnvironmentalConstraints"]])

# Create string data variable for future use
string_data = tf.convert_to_tensor(
    X_train["ProjectName"].astype(str) + " " +
    X_train["PrimaryTechnology"].astype(str) + " " +
    X_train["ProjectDescription"].astype(str),
    dtype=tf.string
)

# Define inputs 
input_numeric = Input(shape=(11,), dtype=tf.float32, name='numeric_input') 
input_string = Input(shape=(1,), dtype=tf.string, name='string_input') 

# Create normalizer to standardize numeric features to a mean of 0 and a standard deviation of 1 and then adapt numeric data to it 
normalizer = Normalization() 
normalizer.adapt(numeric_data) 

# Create normalization layer and pass input layer to it 
normalized_numeric = normalizer(input_numeric) 

# Create text vectorizer to convert strings into integer indices and adapt string data to it 
vectorizer = TextVectorization(output_mode="int", ngrams=1, max_tokens=5000, output_sequence_length=100) 
vectorizer.adapt(string_data)  

# Create text vectorizer layer and pass input layer to it 
vector_strings = vectorizer(input_string) 

# Create embedding layer to convert integer indices into fixed-size vectors(embeddings) and then pass in vectorizer layer 
embedded_strings = Embedding(input_dim=len(vectorizer.get_vocabulary()), output_dim=8)(vector_strings) 

# Add dropout layer to reduce overfitting
embedded_strings_drop = Dropout(0.3)(embedded_strings)

# Create global average pooling layer to average the sequence dimension and create a single vector 
pooled_strings = GlobalAveragePooling1D()(embedded_strings_drop) 

# Concatenate processed features into a single vector  
concatenated = Concatenate()([pooled_strings, normalized_numeric]) 

# Add batch normalization layer in order to stabilize and speed up training 
x = BatchNormalization()(concatenated) 

# Add dense layer with relu activation
x = Dense(64, activation="relu")(x) 

#  Add dense layer with relu activation
x = Dense(32, activation="relu")(x) 

# Add dropout layer to reduce overfitting 
x = Dropout(0.3)(x) 

# Add second dense layer with relu activation
x = Dense(32, activation="relu")(x) 

# Create output layers and pass in previous layers
primary_out = Dense(10, activation="softmax", name="primary_field")(x)
contrib_out = Dense(10, activation="linear", name="contributions")(x)
complexity_out = Dense(1, activation="linear", name="complexity")(x)

# Define model with previous inputs and finalized output 
model = Model(inputs=[input_numeric, input_string], outputs=[primary_out, contrib_out, complexity_out]) 

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
        "contributions": "mse",
        "complexity": "mse"
    },
    loss_weights={
        "primary_field": 1.0,
        "contributions": 0.5,
        "complexity": 0.5
    }
)

# Train the model using the fit() method while passing in the training inputs and labels and storing the history in a variable for later analysis 
history = model.fit(
    {
        "numeric_input": numeric_data,
        "string_input": string_data
    },
    {
        "primary_field": y_class_train,
        "contributions": y_pct_train,
        "complexity": y_comp_train
    },
    epochs=25,
    batch_size=32,
    validation_split=0.2
)


# Use stored history variable and matplotlib to visualize accuracy during training 
plt.figure(figsize=(10,5))
plt.plot(history.history["primary_field_accuracy"], label="Train Accuracy")
plt.plot(history.history["val_primary_field_accuracy"], label="Validation Accuracy")
plt.title("Primary Field Classification Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.show()

# Save model to chosen path for later use (shown here) 
model.save("C:/Users/ccoff/OneDrive/Chases Stuff/Core/AiMl/AIEngineering/core/engineering_model.keras") 
